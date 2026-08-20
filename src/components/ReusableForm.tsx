import { useEffect, useState } from "react";
import Button from "./Button";
import ImageUploadField from "./ImageUploadField";
import InputField from "./CommonInput";
import MapPicker from "./MapPicker";
import TagInput from "../components/Taginput";
import PoliciesEditor, {
    type Policies,
} from "./PoliciesEditor";
import JsonObjectEditor, {
    type SchemaField,
} from "../components/Jsonobjecteditor";
import SelectField from "./SelectField";
import { getPositionFromMapLink } from "../utils/getPositionFromMapLink";

export interface FieldOption {
    label: string;
    value: string | number;
    isCreateOption?: boolean;
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
    | "json-object"
    | "multi-select";

    multiple?: boolean;
    placeholder?: string;
    fullWidth?: boolean;
    required?: boolean;
    options?: FieldOption[];
    suggestions?: string[];
    schema?: SchemaField[];
    onOptionSelect?: (option: FieldOption) => void;
    repeatable?: boolean;
    onMediaDelete?: (
        mediaType: "image" | "video",
        mediaId: string
    ) => void;
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
    resetKey?: string | number;
}

export default function ReusableForm({
    title,
    fields,
    initialValues,
    submitText = "Save",
    onSubmit,
    onClose,
    loading,
    onFieldChange,
    resetKey,
}: ReusableFormProps) {
    const [formData, setFormData] =
        useState<Record<string, any>>(initialValues);


    useEffect(() => {
        if (Object.keys(initialValues).length > 0) {
            setFormData(initialValues);
        }
    }, [initialValues, resetKey]);



    const handleChange = (name: string, value: any) => {
        const field = fields.find(f => f.name === name);
        if (field?.onOptionSelect && typeof value === 'object' && value.isCreateOption) {
            field.onOptionSelect(value);
            return;
        }

        setFormData((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            if (name === "locationId") {
                updated.subLocationId = "";
            }

            if (name === "stayType") {
                updated.hourlyStay = {
                    ...(prev.hourlyStay || {}),
                    isAllowed:
                        value === "hourly" ||
                        value === "both",
                };
            }

            if (name === "capacity") {
                const maxGuests = Number(
                    value.maxGuests || 0
                );

                let adults = Number(
                    value.adults || 0
                );

                let children = Number(
                    value.children || 0
                );

                if (adults > maxGuests) {
                    adults = maxGuests;
                }

                if (
                    adults + children >
                    maxGuests
                ) {
                    children = Math.max(
                        0,
                        maxGuests - adults
                    );
                }

                updated.capacity = {
                    ...value,
                    adults,
                    children,
                };
            }

            return updated;
        });

        onFieldChange?.(name, value);
    };

    const handleSubmit = (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white border border-slate-200 rounded-2xl p-6"
        >
            {title && (
                <h2 className="text-xl font-semibold mb-6">
                    {title}
                </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {fields.map((field) => (
                    <div
                        key={field.name}
                        className={
                            field.fullWidth
                                ? "md:col-span-2"
                                : ""
                        }
                    >
                        {field.type ===
                            "checkbox" ? (
                            <div className="flex items-center gap-3 mt-8">
                                <input
                                    type="checkbox"
                                    checked={
                                        formData[
                                        field.name
                                        ] || false
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            field.name,
                                            e.target.checked
                                        )
                                    }
                                    className="h-4 w-4 accent-[#fa0400] cursor-pointer"
                                />

                                <label className="text-sm font-medium text-slate-700 cursor-pointer">
                                    {field.label}
                                </label>
                            </div>
                        ) : field.type ===
                            "tags" ? (
                            <TagInput
                                label={field.label}
                                value={
                                    formData[
                                    field.name
                                    ] || []
                                }
                                onChange={(tags) =>
                                    handleChange(
                                        field.name,
                                        tags
                                    )
                                }
                                placeholder={
                                    field.placeholder
                                }
                                suggestions={
                                    field.suggestions
                                }
                                required={
                                    field.required
                                }
                            />
                        ) : field.type ===
                            "policies" ? (
                            <PoliciesEditor
                                label={field.label}
                                value={
                                    formData[
                                    field.name
                                    ]
                                }
                                onChange={(val: Policies) =>
                                    handleChange(
                                        field.name,
                                        val
                                    )
                                }
                            />
                        ) : field.type ===
                            "json-object" ? (
                            <JsonObjectEditor
                                label={field.label}
                                value={
                                    formData[
                                    field.name
                                    ] || {}
                                }
                                onChange={(val) =>
                                    handleChange(
                                        field.name,
                                        val
                                    )
                                }
                                schema={
                                    field.schema
                                }
                                required={
                                    field.required
                                }
                                repeatable={field.repeatable}
                            />
                        ) : field.type ===
                            "textarea" ? (
                            <>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {field.label}
                                    {field.required && (
                                        <span className="text-red-500 ml-0.5">
                                            *
                                        </span>
                                    )}
                                </label>

                                <textarea
                                    rows={4}
                                    value={
                                        formData[
                                        field.name
                                        ] || ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            field.name,
                                            e.target.value
                                        )
                                    }
                                    placeholder={
                                        field.placeholder
                                    }
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2 h-30 outline-0 text-sm"
                                />
                            </>
                        ) : field.type ===
                            "select" ||
                            field.type ===
                            "multi-select" ? (
                            <SelectField
                                name={
                                    field.label
                                }
                                value={
                                    field.type ===
                                        "multi-select"
                                        ? formData[
                                        field
                                            .name
                                        ] || []
                                        : formData[
                                        field
                                            .name
                                        ] || ""
                                }
                                options={
                                    field.options ||
                                    []
                                }
                                placeholder={
                                    field.type ===
                                        "multi-select"
                                        ? "Select options"
                                        : "Select"
                                }
                                searchable
                                multiple={
                                    field.type ===
                                    "multi-select"
                                }
                                onChange={(value) => {
                                    const option = field.options?.find(o => o.value === value);
                                    if (option?.isCreateOption && field.onOptionSelect) {
                                        field.onOptionSelect(option);
                                        return;
                                    }
                                    handleChange(
                                        field.name,
                                        value
                                    );
                                }}
                            />
                        ) : field.type === "file" ? (
                            <ImageUploadField
                                label={field.label}
                                multiple={field.multiple}
                                onMediaDelete={field.onMediaDelete}
                                accept={
                                    field.name
                                        .toLowerCase()
                                        .includes("video")
                                        ? "video/*"
                                        : "image/*"
                                }
                                value={formData[field.name]}
                                onChange={(file) =>
                                    handleChange(
                                        field.name,
                                        file
                                    )
                                }
                                videoMeta={
                                    formData.videosMeta || []
                                }
                                onVideoMetaChange={(meta) =>
                                    handleChange(
                                        "videosMeta",
                                        meta
                                    )
                                }
                            />

                        ) : field.type ===
                            "map" ? (
                            <>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {
                                        field.label
                                    }
                                </label>

                                <MapPicker
                                    onSelect={({ mapLink, latitude, longitude }) => {
                                        handleChange("mapLink", mapLink);
                                        handleChange("coordinates", {
                                            latitude: Number(latitude),
                                            longitude: Number(longitude),
                                        });
                                    }}
                                    initialPosition={
                                        formData.coordinates?.latitude &&
                                            formData.coordinates?.longitude
                                            ? {
                                                lat: Number(formData.coordinates.latitude),
                                                lng: Number(formData.coordinates.longitude),
                                            }
                                            : getPositionFromMapLink(formData[field.name])
                                    }
                                />
                            </>
                        ) : (
                            <>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    {field.label}
                                    {field.required && (
                                        <span className="text-red-500 ml-0.5">
                                            *
                                        </span>
                                    )}
                                </label>

                                <InputField
                                    type={
                                        field.type
                                    }
                                    name={
                                        field.name
                                    }
                                    placeholder={
                                        field.placeholder
                                    }
                                    value={
                                        formData[
                                        field.name
                                        ] || ""
                                    }
                                    onChange={(e) =>
                                        handleChange(
                                            field.name,
                                            e.target
                                                .value
                                        )
                                    }
                                    showLabel={
                                        false
                                    }
                                />
                            </>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    type="submit"
                    disabled={loading}
                >
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