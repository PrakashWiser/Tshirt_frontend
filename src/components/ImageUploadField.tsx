import { UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CustomImage from "./Image";

interface ImageUploadFieldProps {
    label?: string;
    value?: string | string[] | File | File[] | null;
    accept?: string;
    multiple?: boolean;
    onChange: (file: any) => void;
}

export default function ImageUploadField({
    label,
    value,
    onChange,
    multiple = false,
    accept = "image/*",
}: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isVideo = accept.includes("video");
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    useEffect(() => {
        if (!value) {
            setPreviewUrls([]);
            return;
        }

        if (Array.isArray(value)) {
            const urls = value.map((item) =>
                item instanceof File ? URL.createObjectURL(item) : item
            );
            setPreviewUrls(urls);
            return () => {
                urls.forEach((url) => {
                    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
                });
            };
        }

        if (value instanceof File) {
            const url = URL.createObjectURL(value);
            setPreviewUrls([url]);
            return () => URL.revokeObjectURL(url);
        }

        setPreviewUrls([value]);
    }, [value]);

    const handleRemove = (index: number) => {
        if (!Array.isArray(value)) {
            onChange(null);
            return;
        }

        const updated = [...value];
        updated.splice(index, 1);
        onChange(updated.length ? updated : null);
    };

    const hasPreview = previewUrls.length > 0;

    return (
        <div className="w-full space-y-3">
            {label && (
                <label className="block text-sm font-medium text-slate-700">
                    {label}
                </label>
            )}

            <div
                onClick={() => inputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 cursor-pointer hover:border-[#fa0400] transition-colors"
            >
                <div className="flex flex-col items-center">
                    <UploadCloud
                        size={42}
                        className="text-slate-400"
                    />

                    <p className="mt-3 text-sm font-semibold">
                        {hasPreview
                            ? "Upload More"
                            : isVideo
                                ? "Upload Video"
                                : "Upload Images"}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                        {isVideo
                            ? "MP4, MOV, WEBM • Max 50MB"
                            : "JPG, PNG, JPEG, WEBP • Max 5MB each"}
                    </p>
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                hidden
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length) return;

                    if (multiple) {
                        const existing: any[] = Array.isArray(value) ? value : [];
                        onChange([...existing, ...files]);

                    } else {
                        onChange(files[0] ?? null);
                    }

                    e.target.value = "";
                }}
            />
            {hasPreview && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative shrink-0">
                            {isVideo ? (
                                <video
                                    controls
                                    className="w-40 h-40 rounded-xl border object-cover"
                                >
                                    <source src={url} />
                                </video>
                            ) : (
                                <CustomImage
                                    src={url}
                                    alt={`preview-${index}`}
                                    className="w-35 h-35 rounded-xl border object-cover"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="absolute top-1 right-1 w-5 h-5   cursor-pointer rounded-full bg-red-500 text-white flex items-center justify-center"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>

    );
}