import { useEffect, useState } from "react";
import Button from "./Button";
import ImageUploadField from "./ImageUploadField";
import InputField from "./CommonInput";
import MapPicker from "./MapPicker";
import TagInput from "../components/Taginput";
import PoliciesEditor from "../components/Policieseditor";
import JsonObjectEditor, { type SchemaField } from "../components/Jsonobjecteditor";
import { getPositionFromMapLink } from "../utils/getPositionFromMapLink";

export interface FieldOption {
    label: string;
    value: string | number;
}

export interface FormField {
    name: string;
    label: string;
    type:
    | "text"
    | "email"
    | "number"
    | "password"
    | "textarea"
    | "select"
    | "file"
    | "date"
    | "checkbox"
    | "map"
    | "tags"
    | "policies"
    | "json-object";
    multiple?: boolean;
    placeholder?: string;
    fullWidth?: boolean;
    required?: boolean;
    options?: FieldOption[];
    suggestions?: string[];
    schema?: SchemaField[];
}

interface ReusableFormProps {
    title?: string;
    fields: FormField[];
    initialValues: Record<string, any>;
    submitText?: string;
    onClose: () => void;
    loading?: boolean;
    onSubmit: (values: Record<string, any>) => void;
    onFieldChange?: (name: string, value: any) => void;
}

export default function ReusableForm({
    title,
    fields,
    initialValues,
    submitText = "Save",
    onSubmit,
    onClose,
    loading,
    onFieldChange
}: ReusableFormProps) {
    const [formData, setFormData] = useState(initialValues);

    useEffect(() => {
        setFormData(initialValues);
    }, [initialValues]);

    const handleChange = (name: string, value: any) => {
        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };
            if (name === "locationId") {
                updated.subLocationId = "";
            }

            return updated;
        });

        onFieldChange?.(name, value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6"
        >
            {title && (
                <h2 className="text-xl font-semibold mb-6">{title}</h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map((field) => (
                    <div
                        key={field.name}
                        className={field.fullWidth ? "md:col-span-2" : ""}
                    >
                        {field.type === "checkbox" ? (
                            <div className="flex items-center gap-3 mt-8">
                                <input
                                    type="checkbox"
                                    checked={formData[field.name] || false}
                                    onChange={(e) => handleChange(field.name, e.target.checked)}
                                    className="h-4 w-4 accent-[#fa0400] cursor-pointer"
                                />
                                <label className="text-sm font-medium text-slate-700 cursor-pointer">
                                    {field.label}
                                </label>
                            </div>

                        ) : field.type === "tags" ? (
                            <TagInput
                                label={field.label}
                                value={formData[field.name] || []}
                                onChange={(tags) => handleChange(field.name, tags)}
                                placeholder={field.placeholder}
                                suggestions={field.suggestions}
                                required={field.required}
                            />

                        ) : field.type === "policies" ? (
                            <PoliciesEditor
                                label={field.label}
                                value={formData[field.name]}
                                onChange={(val) => handleChange(field.name, val)}
                            />

                        ) : field.type === "json-object" ? (
                            <JsonObjectEditor
                                label={field.label}
                                value={formData[field.name] || {}}
                                onChange={(val) => handleChange(field.name, val)}
                                schema={field.schema}
                                required={field.required}
                            />

                        ) : field.type === "textarea" ? (
                            <>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    placeholder={field.placeholder}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 h-30 outline-0 text-sm"
                                />
                            </>

                        ) : field.type === "select" ? (
                            <>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                </label>
                                <select
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    className="w-full border border-slate-200 rounded-sm px-4 py-2 outline-0 text-sm"
                                >
                                    <option value="">Select</option>
                                    {field.options?.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </>

                        ) : field.type === "file" ? (
                            <ImageUploadField
                                label={field.label}
                                multiple={field.multiple}
                                accept={field.name.includes("Video") ? "video/*" : "image/*"}
                                value={formData[field.name]}
                                onChange={(file) => handleChange(field.name, file)}
                            />

                        ) : field.type === "map" ? (
                            <>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {field.label}
                                </label>
                                <MapPicker
                                    onSelect={(link) => handleChange(field.name, link)}
                                    initialPosition={getPositionFromMapLink(formData[field.name])}
                                />
                            </>

                        ) : (
                            <>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                                </label>
                                <InputField
                                    type={field.type}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={formData[field.name] || ""}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    showLabel={false}
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Loading...
                        </div>
                    ) : (
                        submitText
                    )}
                </Button>
            </div>
        </form>
    );
}