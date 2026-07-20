import { useState, useRef, type KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
    label: string;
    value: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    suggestions?: string[];
    required?: boolean;
}

export default function TagInput({
    label,
    value = [],
    onChange,
    placeholder = "Type and press Enter or +",
    suggestions = [],
    required,
}: TagInputProps) {
    const [input, setInput] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addTag = (tag: string) => {
        const trimmed = tag.trim();
        if (!trimmed || value.includes(trimmed)) return;
        onChange([...value, trimmed]);
        setInput("");
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    const removeTag = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag(input);
        } else if (e.key === "Backspace" && !input && value.length > 0) {
            removeTag(value.length - 1);
        }
    };

    const filtered = suggestions.filter(
        (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
    );

    return (
        <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-slate-700">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>

            <div
                className="min-h-[44px] flex flex-wrap gap-1.5 p-2 rounded-sm border border-slate-200 bg-white cursor-text focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all"
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((tag, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                            className="hover:text-slate-900 transition-colors"
                            aria-label={`Remove ${tag}`}
                        >
                            <X size={11} strokeWidth={2.5} />
                        </button>
                    </span>
                ))}

                <div className="flex items-center gap-1 flex-1 min-w-[120px]">
                    <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => { setInput(e.target.value); setShowSuggestions(true); }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder={value.length === 0 ? placeholder : "Add more..."}
                        className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none min-w-0"
                    />
                    {input.trim() && (
                        <button
                            type="button"
                            onClick={() => addTag(input)}
                            className="flex-shrink-0 p-0.5 rounded-full bg-slate-800 hover:bg-slate-600 transition-colors"
                            aria-label="Add tag"
                        >
                            <Plus size={12} strokeWidth={2.5} className="text-white" />
                        </button>
                    )}
                </div>
            </div>

            {showSuggestions && filtered.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-10 relative">
                    {filtered.slice(0, 6).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onMouseDown={() => addTag(s)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {value.length > 0 && (
                <p className="text-xs text-slate-400">
                    {value.length} item{value.length !== 1 ? "s" : ""} added
                </p>
            )}
        </div>
    );
}