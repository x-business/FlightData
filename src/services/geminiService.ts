import { GoogleGenAI } from "@google/genai";
import type { FlightFilters } from "../types/flight";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const MODEL = "gemini-2.5-flash";

export async function parseNaturalLanguageQuery(
  query: string
): Promise<FlightFilters | null> {
  if (!query?.trim()) return null;

  const today = new Date().toISOString().split("T")[0];

  const prompt = `
You are an extractor that converts a user's natural language flight query into a strict JSON object containing only the fields below.

Today's date: ${today}
Available data dates: 2025-10-02, 2025-10-03, 2025-10-08, 2025-10-09, 2025-10-10

Query: "${query}"

Return ONLY a valid JSON object (no explanation, no markdown, no extra text) with these optional fields:
{
  "service_date": "YYYY-MM-DD (one of the available dates)",
  "origin_data": "3-letter airport code",
  "destination_data": "3-letter airport code",
  "airline_data": "2-letter airline code",
  "route_data": "XXX-YYY",
  "sortBy": "departure_time" | "arrival_time" | "airline",
  "limit": number,
  "departure_time_range": ["morning" | "afternoon" | "evening" | "night"]
}

Important rules for departure_time_range:
- Always return an array (e.g. [] or ["afternoon"] or ["afternoon","evening"]).
- Canonical values are exactly: "morning", "afternoon", "evening", "night".
- Use these time definitions:
  - morning: 05:00 – 11:59
  - afternoon: 12:00 – 17:59
  - evening: 18:00 – 22:59
  - night: 23:00 – 04:59
- Mapping examples (must follow exactly):
  - "after lunch", "after noon" => ["afternoon","evening","night"]
  - "after 12:30", "after 1pm" => include the range containing that time and all later ranges of the day (e.g. after 12:30 => ["afternoon","evening","night"])
  - "between 15:00 and 23:00" => ["afternoon","evening"]
  - "late night", "overnight" => ["night"]
  - "morning flights" => ["morning"]
  - "any", "all day", "no preference" => []
- If the query lists multiple ranges ("morning or evening"), return both: ["morning","evening"].
- If nothing about departure time is specified, return an empty array: [].

Return ONLY the JSON object and nothing else.
`;

  try {
    const result = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text =
      result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
      result?.output?.[0]?.content?.[0]?.text?.trim();

    if (!text) {
      console.error("No response text from Gemini", result);
      return null;
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not find JSON in Gemini response:", text);
      return null;
    }

    // parse whatever Gemini returned
    const raw: any = JSON.parse(jsonMatch[0]);

    // --- helpers to normalize a departure_time_range and parse query as fallback ---
    const ALLOWED = ["morning", "afternoon", "evening", "night"] as const;
    type RangeName = typeof ALLOWED[number];

    function normalizeArray(input: any): RangeName[] {
      if (!input) return [];
      if (Array.isArray(input)) {
        return Array.from(
          new Set(
            input
              .map((v) => String(v || "").toLowerCase().trim())
              .map((v) =>
                v
                  .replace(/\s+/g, " ")
                  .replace(/late[-\s]?night|overnight/, "night")
                  .replace(/after noon|after lunch/, "after noon")
              )
          )
        )
          .map(mapSynonymToCanonical)
          .filter(Boolean) as RangeName[];
      }
      // if provided as a single string, maybe comma-separated
      if (typeof input === "string") {
        const parts = input.split(/[,;|\/]+/).map((s) => s.trim());
        return normalizeArray(parts);
      }
      return [];
    }

    function mapSynonymToCanonical(v: string | undefined | null): RangeName | null {
      if (!v) return null;
      const s = v.toLowerCase();
      if (s === "any" || s === "all" || s === "all day" || s === "no preference") return null;
      if (s.includes("morning")) return "morning";
      if (s.includes("afternoon") || s.includes("after noon") || s.includes("after lunch"))
        return "afternoon";
      if (s.includes("evening")) return "evening";
      if (s.includes("night") || s.includes("late night") || s.includes("overnight")) return "night";
      // allow direct canonical
      if (ALLOWED.includes(s as RangeName)) return s as RangeName;
      return null;
    }

    function parseTimeStringToMinutes(t: string): number | null {
      if (!t) return null;
      const q = t.toLowerCase().trim();
      if (q === "noon") return 12 * 60;
      if (q === "midnight") return 0;
      // match 24h HH:MM or H:MM
      let m = q.match(/^\s*(\d{1,2}):(\d{2})\s*$/);
      if (m) {
        let hh = parseInt(m[1], 10);
        const mm = parseInt(m[2], 10);
        if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) return hh * 60 + mm;
      }
      // match H or H am/pm, H:MM am/pm
      m = q.match(/^\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*$/i);
      if (m) {
        let hh = parseInt(m[1], 10);
        const mm = m[2] ? parseInt(m[2], 10) : 0;
        const ap = (m[3] || "").toLowerCase();
        if (ap === "pm" && hh < 12) hh += 12;
        if (ap === "am" && hh === 12) hh = 0;
        if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) return hh * 60 + mm;
      }
      return null;
    }

    // range definitions in minutes (0-1439). Night is split when checking.
    const RANGE_DEFS: { name: RangeName; start: number; end: number }[] = [
      { name: "morning", start: 5 * 60, end: 11 * 60 + 59 }, // 05:00-11:59
      { name: "afternoon", start: 12 * 60, end: 17 * 60 + 59 }, // 12:00-17:59
      { name: "evening", start: 18 * 60, end: 22 * 60 + 59 }, // 18:00-22:59
      // night handled specially (23:00-23:59 and 00:00-04:59)
      { name: "night", start: 23 * 60, end: 4 * 60 + 59 },
    ];

    function timeToRangeIndex(mins: number): number {
      if (mins >= RANGE_DEFS[0].start && mins <= RANGE_DEFS[0].end) return 0; // morning
      if (mins >= RANGE_DEFS[1].start && mins <= RANGE_DEFS[1].end) return 1; // afternoon
      if (mins >= RANGE_DEFS[2].start && mins <= RANGE_DEFS[2].end) return 2; // evening
      // night: either >= 23:00 or <= 04:59
      if (mins >= 23 * 60 || mins <= 4 * 60 + 59) return 3;
      // fallback
      return 0;
    }

    // include ranges from startIndex .. 3 (end of day). e.g., after lunch => afternoon..night
    function rangesFromIndexToEnd(idx: number): RangeName[] {
      const res: RangeName[] = [];
      for (let i = idx; i <= 3; i++) res.push(RANGE_DEFS[i].name);
      return res;
    }

    // check overlap helper for "between a and b"
    function rangesOverlappingInterval(aMin: number, bMin: number): RangeName[] {
      const result: RangeName[] = [];
      for (const r of RANGE_DEFS) {
        if (r.name === "night") {
          // check [1380,1439] and [0,299]
          const part1start = 23 * 60,
            part1end = 24 * 60 - 1;
          const part2start = 0,
            part2end = 4 * 60 + 59;
          const overlaps = (partStart: number, partEnd: number) =>
            !(bMin < partStart || aMin > partEnd);
          if (overlaps(part1start, part1end) || overlaps(part2start, part2end)) {
            result.push("night");
          }
        } else {
          const overlaps = !(bMin < r.start || aMin > r.end);
          if (overlaps) result.push(r.name);
        }
      }
      return result;
    }

    function parseQueryFallback(q: string): RangeName[] {
      const s = q.toLowerCase();
      // explicit phrases
      if (/\b(after lunch|after noon)\b/.test(s)) return ["afternoon", "evening", "night"];
      if (/\b(late night|overnight|late-night)\b/.test(s)) return ["night"];
      if (/\b(morning|am only|morning flights)\b/.test(s)) return ["morning"];
      if (/\b(afternoon|pm only|afternoon flights)\b/.test(s)) return ["afternoon"];
      if (/\b(evening|evening flights)\b/.test(s)) return ["evening"];
      if (/\b(any time|all day|no preference|any)\b/.test(s)) return [];

      // "after <time>"
      let m = s.match(/\bafter\s+([0-9:\sapm]+)\b/);
      if (m) {
        const t = parseTimeStringToMinutes(m[1]);
        if (t !== null) {
          const idx = timeToRangeIndex(t);
          return rangesFromIndexToEnd(idx);
        }
      }

      // "before <time>"
      m = s.match(/\bbefore\s+([0-9:\sapm]+)\b/);
      if (m) {
        const t = parseTimeStringToMinutes(m[1]);
        if (t !== null) {
          // include ranges strictly before the one containing t
          const idx = timeToRangeIndex(t);
          if (idx === 0) return []; // before morning => no ranges
          const res: RangeName[] = [];
          for (let i = 0; i < idx; i++) res.push(RANGE_DEFS[i].name);
          return res;
        }
      }

      // "between X and Y"
      m = s.match(/\bbetween\s+([0-9:\sapm]+)\s+(and|-)\s+([0-9:\sapm]+)\b/);
      if (m) {
        const a = parseTimeStringToMinutes(m[1]);
        const b = parseTimeStringToMinutes(m[3]);
        if (a !== null && b !== null) {
          // normalize a<=b (if cross-midnight, handle by converting b < a -> treat as next day)
          let aMin = a;
          let bMin = b;
          if (aMin <= bMin) {
            return rangesOverlappingInterval(aMin, bMin);
          } else {
            // crosses midnight -> check [a, 1439] and [0, b]
            const first = rangesOverlappingInterval(aMin, 24 * 60 - 1);
            const second = rangesOverlappingInterval(0, bMin);
            return Array.from(new Set([...first, ...second]));
          }
        }
      }

      // explicit keywords combined or separated by commas: "morning, evening"
      const hits: RangeName[] = [];
      if (s.includes("morning")) hits.push("morning");
      if (s.includes("afternoon")) hits.push("afternoon");
      if (s.includes("evening")) hits.push("evening");
      if (s.includes("night") || s.includes("late night") || s.includes("overnight")) hits.push("night");
      if (hits.length > 0) return Array.from(new Set(hits));

      return [];
    }

    // normalize whatever Gemini returned (array / string / null)
    let normalized = normalizeArray(raw?.departure_time_range);

    // if normalization produced nothing, attempt query fallback parsing
    if (normalized.length === 0) {
      const fallback = parseQueryFallback(String(query || ""));
      normalized = fallback;
    }

    // ensure unique and only allowed canonical values
    normalized = Array.from(new Set(normalized.filter((r) => ALLOWED.includes(r as any)))) as RangeName[];

    // --- apply defaults and final tidying ---
    const filters: any = { ...(raw || {}) };
    if (!filters.service_date) filters.service_date = "2025-10-09";
    filters.limit = filters.limit || 20;
    filters.departure_time_range = normalized; // always array (maybe empty)

    return filters as FlightFilters;
  } catch (error) {
    console.error("Error parsing natural language query:", error);
    return null;
  }
}
