import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";

export function MultiSelect({
    value,
    onChange,
    options,
}: {
    value: string[];
    onChange: (selected: string[]) => void;
    options: { value: string; label: string }[];
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleOption = (val: string) => {
        const newValue = value.includes(val)
            ? value.filter((v) => v !== val)
            : [...value, val];
        onChange(newValue);
    };

    // close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 
        rounded-lg text-gray-700 focus:outline-none focus:ring-2 
        focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 
        hover:border-gray-400 hover:shadow-sm"
            >
                <div className="flex flex-wrap gap-1 text-left">
                    {value.length > 0 ? (
                        value.map((val) => {
                            const label = options.find((o) => o.value === val)?.label || val;
                            return (
                                <span
                                    key={val}
                                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-sm font-medium"
                                >
                                    {label}
                                </span>
                            );
                        })
                    ) : (
                        <span className="text-gray-400">Select time ranges...</span>
                    )}
                </div>
                <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => toggleOption(opt.value)}
                            className="w-full flex items-center justify-between px-4 py-2 text-left text-gray-700 hover:bg-blue-50"
                        >
                            <span>{opt.label}</span>
                            {value.includes(opt.value) && (
                                <Check className="w-4 h-4 text-blue-500" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
