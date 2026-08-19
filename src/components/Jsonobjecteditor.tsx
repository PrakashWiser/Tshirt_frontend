import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import MapPicker from "./MapPicker";

interface JsonObjectEditorProps {
    label: string;
    value: Record<string, any> | any[];
    onChange: (val: Record<string, any> | any[]) => void;
    schema?: SchemaField[];
    required?: boolean;
    repeatable?: boolean;
}

export interface SchemaField {
    key: string;
    label: string;
    type: "text" | "number" | "boolean" | "select" | "json-object" | "map";
    placeholder?: string;
    options?: { label: string; value: string }[];
    defaultValue?: any;
    schema?: SchemaField[];
}

export default function JsonObjectEditor({
    label,
    value = {},
    onChange,
    schema,
    required,
    repeatable = false,
}: JsonObjectEditorProps) {
    const [pairs, setPairs] = useState<{ key: string; val: string }[]>([]);
    const [arrayItems, setArrayItems] = useState<any[]>([]);

    useEffect(() => {
        if (schema && repeatable) {
            if (Array.isArray(value)) {
                setArrayItems(value);
            } else {
                setArrayItems([]);
            }
            return;
        }
        if (schema) return;
        const entries = Object.entries(value || {}).map(([key, val]) => ({
            key,
            val: String(val),
        }));
        setPairs(entries.length > 0 ? entries : []);
    }, [schema, value, repeatable]);

    const renderField = (field: SchemaField, currentValue: any, onChangeHandler: (val: any) => void) => {
        if (field.type === "map") {
            const coords = currentValue || [];
            return (
                <div className="flex-1">
                    <MapPicker
                        onSelect={({ latitude, longitude }) => {
                            onChangeHandler([Number(longitude), Number(latitude)]);
                        }}
                        initialPosition={
                            coords && coords.length === 2
                                ? {
                                    lat: Number(coords[1]),
                                    lng: Number(coords[0]),
                                }
                                : undefined
                        }
                        isInput={true}
                        height="300px"
                    />
                </div>
            );
        }

        if (field.type === "json-object") {
            return (
                <div className="flex-1">
                    <JsonObjectEditor
                        label=""
                        value={currentValue || {}}
                        onChange={onChangeHandler}
                        schema={field.schema}
                    />
                </div>
            );
        }

        if (field.type === "boolean") {
            return (
                <button
                    type="button"
                    role="switch"
                    aria-checked={!!currentValue}
                    onClick={() => onChangeHandler(!currentValue)}
                    className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${currentValue ? "bg-slate-800" : "bg-slate-200"
                        }`}
                >
                    <span
                        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${currentValue ? "translate-x-4" : "translate-x-0"
                            }`}
                    />
                </button>
            );
        }

        if (field.type === "select") {
            return (
                <select
                    value={currentValue ?? ""}
                    onChange={(e) => onChangeHandler(e.target.value)}
                    className="flex-1 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
                >
                    <option value="">Select...</option>
                    {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            );
        }

        return (
            <input
                type={field.type === "number" ? "number" : "text"}
                value={currentValue ?? field.defaultValue ?? ""}
                placeholder={field.placeholder}
                onChange={(e) =>
                    onChangeHandler(
                        field.type === "number" ? Number(e.target.value) : e.target.value
                    )
                }
                className="flex-1 border border-slate-200 rounded-sm px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400"
            />
        );
    };

    if (schema && repeatable) {
        const addItem = () => {
            const newItem: Record<string, any> = {};
            schema.forEach(field => {
                newItem[field.key] = field.defaultValue || "";
            });
            const updated = [...arrayItems, newItem];
            setArrayItems(updated);
            onChange(updated);
        };

        const removeItem = (index: number) => {
            const updated = arrayItems.filter((_, i) => i !== index);
            setArrayItems(updated);
            onChange(updated);
        };

        const updateItem = (index: number, fieldKey: string, fieldValue: any) => {
            const updated = [...arrayItems];
            updated[index] = { ...updated[index], [fieldKey]: fieldValue };
            setArrayItems(updated);
            onChange(updated);
        };

        return (
            <div className="flex flex-col gap-3">
                {label && (
                    <label className="block text-sm font-medium text-slate-700">
                        {label}
                        {required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                )}
                <div className="space-y-4">
                    {arrayItems.map((item, index) => (
                        <div key={index} className="border border-slate-200 rounded-lg p-4 relative">
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={16} />
                            </button>
                            <div className="space-y-3">
                                {schema.map((field) => (
                                    <div key={field.key} className="flex flex-col gap-1">
                                        <label className="text-sm text-slate-600">{field.label}</label>
                                        {renderField(
                                            field,
                                            item[field.key],
                                            (val: any) => updateItem(index, field.key, val)
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#3A29AA] cursor-pointer rounded-lg  transition-colors w-fit"
                >
                    <Plus size={16} />
                    Add {label || "Item"}
                </button>
            </div>
        );
    }

    if (schema) {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="block text-sm font-medium text-slate-700">
                        {label}
                        {required && <span className="text-red-500 ml-0.5">*</span>}
                    </label>
                )}
                <div className="rounded-lg border border-slate-200 bg-white overflow-hidden divide-y divide-slate-100">
                    {schema.map((field) => (
                        <div key={field.key} className="flex flex-col gap-2 px-4 py-2.5">
                            <span className="text-sm text-slate-500 flex-shrink-0">{field.label}</span>
                            {renderField(
                                field,
                                (value as Record<string, any>)[field.key],
                                (val: any) => onChange({ ...(value as Record<string, any>), [field.key]: val })
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

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
            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
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
                                    className="flex-1 border border-slate-200 rounded-sm px-2.5 py-1.5 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-slate-400"
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