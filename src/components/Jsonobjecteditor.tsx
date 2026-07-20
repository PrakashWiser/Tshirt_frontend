import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

interface JsonObjectEditorProps {
    label: string;
    value: Record<string, any>;
    onChange: (val: Record<string, any>) => void;
    schema?: SchemaField[];
    required?: boolean;
}

export interface SchemaField {
    key: string;
    label: string;
    type: "text" | "number" | "boolean" | "select";
    placeholder?: string;
    options?: { label: string; value: string }[];
    defaultValue?: any;
}

export default function JsonObjectEditor({
    label,
    value = {},
    onChange,
    schema,
    required,
}: JsonObjectEditorProps) {
    const [pairs, setPairs] = useState<{ key: string; val: string }[]>([]);

    useEffect(() => {
        if (schema) return;
        const entries = Object.entries(value || {}).map(([key, val]) => ({
            key,
            val: String(val),
        }));
        setPairs(entries.length > 0 ? entries : []);
    }, []);

    if (schema) {
        return (
            <div className="flex flex-col gap-1.5">
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="rounded-sm border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
                    {schema.map((field) => (
                        <div key={field.key} className="flex items-center gap-3 px-4 py-2.5">
                            <span className="text-sm text-slate-500 w-36 flex-shrink-0">{field.label}</span>

                            {field.type === "boolean" ? (
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={!!value[field.key]}
                                    onClick={() => onChange({ ...value, [field.key]: !value[field.key] })}
                                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${value[field.key] ? "bg-slate-800" : "bg-slate-200"
                                        }`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${value[field.key] ? "translate-x-4" : "translate-x-0"
                                            }`}
                                    />
                                </button>
                            ) : field.type === "select" ? (
                                <select
                                    value={value[field.key] ?? ""}
                                    onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
                                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400"
                                >
                                    {field.options?.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type={field.type === "number" ? "number" : "text"}
                                    value={value[field.key] ?? field.defaultValue ?? ""}
                                    placeholder={field.placeholder}
                                    onChange={(e) =>
                                        onChange({
                                            ...value,
                                            [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value,
                                        })
                                    }
                                    className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Free-form key-value mode
    const syncUp = (updated: { key: string; val: string }[]) => {
        const obj = updated.reduce<Record<string, string>>((acc, { key, val }) => {
            if (key.trim()) acc[key.trim()] = val;
            return acc;
        }, {});
        onChange(obj);
    };

    const updatePair = (index: number, field: "key" | "val", newVal: string) => {
        const updated = pairs.map((p, i) => (i === index ? { ...p, [field]: newVal } : p));
        setPairs(updated);
        syncUp(updated);
    };

    const addPair = () => setPairs((p) => [...p, { key: "", val: "" }]);

    const removePair = (index: number) => {
        const updated = pairs.filter((_, i) => i !== index);
        setPairs(updated);
        syncUp(updated);
    };

    return (
        <div className="flex flex-col gap-1.5">
            <label className="block text-sm font-medium text-slate-700">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {pairs.length > 0 && (
                    <div className="divide-y divide-slate-100">
                        {pairs.map((pair, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2">
                                <input
                                    value={pair.key}
                                    onChange={(e) => updatePair(i, "key", e.target.value)}
                                    placeholder="key"
                                    className="w-32 flex-shrink-0 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400"
                                />
                                <span className="text-slate-300 text-sm">:</span>
                                <input
                                    value={pair.val}
                                    onChange={(e) => updatePair(i, "val", e.target.value)}
                                    placeholder="value"
                                    className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => removePair(i)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                                    aria-label="Remove field"
                                >
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <button
                    type="button"
                    onClick={addPair}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-500 hover:bg-slate-50 transition-colors border-t border-slate-100 first:border-t-0"
                >
                    <Plus size={14} />
                    Add field
                </button>
            </div>
        </div>
    );
}