import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "./Button";
import ImageUploadField from "./ImageUploadField";
import InputField from "./CommonInput";
import MapPicker from "./MapPicker";
import TagInput from "../components/Taginput";
import PoliciesEditor, { type Policies } from "./PoliciesEditor";
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

export interface RepeatableSubField {
  name: string;
  label: string;
  type: "text" | "number" | "email" | "password" | "checkbox" | "file";
  placeholder?: string;
  accept?: string;
  colSpan?: 1 | 2 | 3 | 4;
  multiple?: boolean;
}

export interface CheckboxOption {
  name: string;
  label: string;
}

export interface MediaValue {
  id?: string;
  url: string;
  isExisting?: boolean;
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
    | "checkbox-group"
    | "map"
    | "tags"
    | "policies"
    | "json-object"
    | "multi-select"
    | "repeatable-group";

  multiple?: boolean;
  placeholder?: string;
  fullWidth?: boolean;
  required?: boolean;
  options?: FieldOption[];
  suggestions?: string[];
  schema?: SchemaField[];
  onOptionSelect?: (option: FieldOption) => void;
  repeatable?: boolean;
  onMediaDelete?: (mediaType: "image" | "video", mediaId: string) => void;

  onUpload?: (file: File | null) => Promise<string | null>;

  checkboxOptions?: CheckboxOption[];

  subFields?: RepeatableSubField[];
  addLabel?: string;
  emptyItem?: () => Record<string, any>;
  onItemImageUpload?: (
    index: number,
    file: File | null,
    currentItem: Record<string, any>,
  ) => Promise<string> | string;
  onMultiItemImageUpload?: (
    index: number,
    files: File[],
    currentItem: Record<string, any>,
  ) => Promise<string[]> | string[];
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

function RepeatableGroupField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: Record<string, any>[];
  onChange: (items: Record<string, any>[]) => void;
}) {
  const subFields = field.subFields || [];
  const emptyItem = field.emptyItem || (() => ({}));

  const updateItem = (index: number, name: string, v: any) => {
    const next = value.map((item, i) =>
      i === index ? { ...item, [name]: v } : item,
    );
    onChange(next);
  };

  const addItem = () => onChange([...value, emptyItem()]);

  const removeItem = (index: number) => {
    if (value.length === 1) return;
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            {field.label}
          </h3>
          {field.placeholder && (
            <p className="text-xs text-slate-500">{field.placeholder}</p>
          )}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 rounded-xl bg-[#3A29AA] px-3 py-2 text-xs font-medium text-white"
        >
          <Plus size={14} />
          {field.addLabel || "Add"}
        </button>
      </div>

      <div className="space-y-5">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-slate-900">
                  {field.label.replace(/s$/, "")} {index + 1}
                </h4>
                <p className="text-xs text-slate-500">
                  {item.color || "Color"}
                  {item.size ? ` / ${item.size}` : ""}
                </p>
              </div>

              <button
                type="button"
                disabled={value.length === 1}
                onClick={() => removeItem(index)}
                className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {subFields.map((sub) => {
                const colSpan =
                  sub.colSpan === 4
                    ? "xl:col-span-4"
                    : sub.colSpan === 2
                      ? "md:col-span-2"
                      : "";

                if (sub.type === "checkbox") {
                  return (
                    <div
                      key={sub.name}
                      className={`flex items-center gap-2 pt-8 ${colSpan}`}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(item[sub.name])}
                        onChange={(e) =>
                          updateItem(index, sub.name, e.target.checked)
                        }
                        className="h-4 w-4 accent-[#fa0400]"
                      />
                      <label className="text-sm text-slate-700">
                        {sub.label}
                      </label>
                    </div>
                  );
                }

                if (sub.type === "file") {
                  return (
                    <div key={sub.name} className={`xl:col-span-4 ${colSpan}`}>
                      <ImageUploadField
                        label={sub.label}
                        accept={sub.accept || "image/*"}
                        multiple={sub.multiple}
                        value={item[sub.name] ?? (sub.multiple ? [] : null)}
                        onChange={async (incoming: any) => {
                          if (sub.multiple) {
                            const list: any[] = Array.isArray(incoming)
                              ? incoming
                              : [];

                            if (field.onMultiItemImageUpload) {
                              const files = list.filter(
                                (x) => x instanceof File,
                              ) as File[];

                              const existingUrls = list
                                .filter(
                                  (x) =>
                                    typeof x === "string" ||
                                    (x && typeof x === "object" && "url" in x),
                                )
                                .map((x: any) =>
                                  typeof x === "string" ? x : x.url,
                                );

                              const uploaded =
                                files.length > 0
                                  ? await field.onMultiItemImageUpload(
                                      index,
                                      files,
                                      item,
                                    )
                                  : [];

                              const nextUrls = [
                                ...existingUrls,
                                ...uploaded,
                              ].filter(Boolean);

                              updateItem(index, sub.name, nextUrls);
                              return;
                            }

                            if (field.onItemImageUpload) {
                              const urls: string[] = [];
                              for (const x of list) {
                                if (typeof x === "string") urls.push(x);
                                else if (
                                  x &&
                                  typeof x === "object" &&
                                  "url" in x
                                )
                                  urls.push(x.url);
                                else if (x instanceof File) {
                                  const url = await field.onItemImageUpload(
                                    index,
                                    x,
                                    item,
                                  );
                                  if (url) urls.push(url);
                                }
                              }
                              updateItem(index, sub.name, urls);
                              return;
                            }

                            updateItem(index, sub.name, list);
                            return;
                          }

                          if (!incoming) {
                            updateItem(index, sub.name, "");
                            return;
                          }

                          if (field.onItemImageUpload) {
                            const url = await field.onItemImageUpload(
                              index,
                              incoming as File,
                              item,
                            );
                            updateItem(index, sub.name, url);
                            return;
                          }

                          updateItem(index, sub.name, incoming);
                        }}
                      />
                    </div>
                  );
                }

                return (
                  <div key={sub.name} className={colSpan}>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      {sub.label}
                    </label>
                    <InputField
                      type={sub.type}
                      name={sub.name}
                      placeholder={sub.placeholder}
                      value={item[sub.name] ?? ""}
                      showLabel={false}
                      onChange={(e) =>
                        updateItem(index, sub.name, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData(initialValues);
    }
  }, [initialValues, resetKey]);

  const handleChange = (name: string, value: any) => {
    const field = fields.find((f) => f.name === name);

    if (
      field?.onOptionSelect &&
      typeof value === "object" &&
      value.isCreateOption
    ) {
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
          isAllowed: value === "hourly" || value === "both",
        };
      }

      if (name === "capacity") {
        const maxGuests = Number(value.maxGuests || 0);
        let adults = Number(value.adults || 0);
        let children = Number(value.children || 0);

        if (adults > maxGuests) adults = maxGuests;
        if (adults + children > maxGuests) {
          children = Math.max(0, maxGuests - adults);
        }

        updated.capacity = { ...value, adults, children };
      }

      return updated;
    });

    onFieldChange?.(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const normalized = { ...formData };

    fields.forEach((field) => {
      if (field.type !== "file") return;
      if (!field.multiple) return;

      const raw = normalized[field.name];
      if (!Array.isArray(raw)) return;

      const urls: string[] = [];

      for (const item of raw) {
        if (typeof item === "string") urls.push(item);
        else if (item && typeof item === "object" && "url" in item)
          urls.push(item.url);
      }

      normalized[field.name] = urls;
    });

    onSubmit(normalized);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-slate-200 rounded-2xl p-6"
    >
      {title && <h2 className="text-xl font-semibold mb-6">{title}</h2>}

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
            ) : field.type === "checkbox-group" ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {field.label}
                </label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {(field.checkboxOptions || []).map((cb) => (
                    <label
                      key={cb.name}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 p-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData[cb.name] || false}
                        onChange={(e) =>
                          handleChange(cb.name, e.target.checked)
                        }
                        className="h-4 w-4 accent-[#fa0400]"
                      />
                      <span className="text-sm text-slate-700">{cb.label}</span>
                    </label>
                  ))}
                </div>
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
                onChange={(val: Policies) => handleChange(field.name, val)}
              />
            ) : field.type === "json-object" ? (
              <JsonObjectEditor
                label={field.label}
                value={formData[field.name] || {}}
                onChange={(val) => handleChange(field.name, val)}
                schema={field.schema}
                required={field.required}
                repeatable={field.repeatable}
              />
            ) : field.type === "repeatable-group" ? (
              <RepeatableGroupField
                field={field}
                value={formData[field.name] || []}
                onChange={(items) => handleChange(field.name, items)}
              />
            ) : field.type === "textarea" ? (
              <>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  {field.label}
                  {field.required && (
                    <span className="text-red-500 ml-0.5">*</span>
                  )}
                </label>
                <textarea
                  rows={4}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2 h-30 outline-0 text-sm"
                />
              </>
            ) : field.type === "select" || field.type === "multi-select" ? (
              <SelectField
                name={field.label}
                value={
                  field.type === "multi-select"
                    ? formData[field.name] || []
                    : formData[field.name] || ""
                }
                options={field.options || []}
                placeholder={
                  field.type === "multi-select" ? "Select options" : "Select"
                }
                searchable
                multiple={field.type === "multi-select"}
                onChange={(value) => {
                  const option = field.options?.find((o) => o.value === value);
                  if (option?.isCreateOption && field.onOptionSelect) {
                    field.onOptionSelect(option);
                    return;
                  }
                  handleChange(field.name, value);
                }}
              />
            ) : field.type === "file" ? (
              <ImageUploadField
                label={field.label}
                multiple={field.multiple}
                onMediaDelete={field.onMediaDelete}
                accept={
                  field.name.toLowerCase().includes("video")
                    ? "video/*"
                    : "image/*"
                }
                value={formData[field.name]}
                onChange={async (incoming) => {
                  if (!field.multiple) {
                    if (field.onUpload) {
                      const url = await field.onUpload(incoming as File | null);
                      handleChange(field.name, url ?? "");
                    } else {
                      handleChange(field.name, incoming);
                    }
                    return;
                  }

                  const list: any[] = Array.isArray(incoming) ? incoming : [];

                  if (!field.onUpload) {
                    handleChange(field.name, list);
                    return;
                  }

                  const resolved: MediaValue[] = [];

                  for (const item of list) {
                    if (item instanceof File) {
                      try {
                        const url = await field.onUpload(item);
                        if (url) {
                          resolved.push({ url, isExisting: false });
                        }
                      } catch {
                        continue;
                      }
                    } else if (typeof item === "string") {
                      resolved.push({ url: item, isExisting: true });
                    } else if (
                      item &&
                      typeof item === "object" &&
                      "url" in item
                    ) {
                      resolved.push({
                        url: item.url,
                        id: item.id,
                        isExisting: item.isExisting ?? true,
                      });
                    }
                  }

                  handleChange(field.name, resolved);
                }}
                videoMeta={formData.videosMeta || []}
                onVideoMetaChange={(meta) => handleChange("videosMeta", meta)}
              />
            ) : field.type === "map" ? (
              <>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  {field.label}
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
                    <span className="text-red-500 ml-0.5">*</span>
                  )}
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
