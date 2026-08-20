import { UploadCloud, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CustomImage from "./Image";

interface MediaValue {
    id?: string;
    url: string;
    isExisting?: boolean;
}

interface ImageUploadFieldProps {
    label?: string;
    value?:
    | string
    | string[]
    | File
    | File[]
    | MediaValue
    | MediaValue[]
    | null;
    accept?: string;
    multiple?: boolean;
    onChange: (file: any) => void;
    onMediaDelete?: (
        mediaType: "image" | "video",
        mediaId: string
    ) => void;
    videoMeta?: {
        category: string;
    }[];
    onVideoMetaChange?: (
        meta: { category: string }[]
    ) => void;
}

export default function ImageUploadField({
    label,
    value,
    onChange,
    multiple = false,
    accept = "image/*",
    videoMeta = [],
    onVideoMetaChange,
    onMediaDelete,
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
            const urls = value.map((item: any) =>
                item instanceof File
                    ? URL.createObjectURL(item)
                    : typeof item === "object"
                        ? item.url
                        : item
            );

            setPreviewUrls(urls);

            return () => {
                urls.forEach((url) => {
                    if (url.startsWith("blob:")) {
                        URL.revokeObjectURL(url);
                    }
                });
            };
        }

        if (value instanceof File) {
            const url = URL.createObjectURL(value);

            setPreviewUrls([url]);

            return () => {
                URL.revokeObjectURL(url);
            };
        }

        if (typeof value === "object" && value !== null) {
            setPreviewUrls([value.url]);
            return;
        }

        setPreviewUrls([value]);
    }, [value]);

    const handleRemove = (index: number) => {
        if (!Array.isArray(value)) {
            onChange(null);

            if (isVideo) {
                onVideoMetaChange?.([]);
            }

            return;
        }

        const item: any = value[index];

        if (
            item &&
            typeof item === "object" &&
            !(item instanceof File) &&
            item.isExisting &&
            item.id
        ) {
            onMediaDelete?.(
                isVideo ? "video" : "image",
                item.id
            );
        }

        const updatedFiles = [...value];

        updatedFiles.splice(index, 1);

        onChange(
            updatedFiles.length
                ? updatedFiles
                : null
        );

        if (isVideo) {
            const updatedMeta = [...videoMeta];

            updatedMeta.splice(index, 1);

            onVideoMetaChange?.(updatedMeta);
        }
    };

    const handleCategoryChange = (
        index: number,
        category: string
    ) => {
        const updatedMeta = [...videoMeta];

        updatedMeta[index] = {
            category,
        };

        onVideoMetaChange?.(updatedMeta);
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
                onClick={() =>
                    inputRef.current?.click()
                }
                className="w-full border-2 border-dashed border-slate-300 rounded-2xl p-8 cursor-pointer hover:border-[#3A29AA] transition-colors"
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
                    const files = Array.from(
                        e.target.files || []
                    );

                    if (!files.length) return;

                    if (multiple) {
                        const existing: any[] =
                            Array.isArray(value)
                                ? value
                                : [];

                        const updatedFiles = [
                            ...existing,
                            ...files,
                        ];

                        onChange(updatedFiles);

                        if (isVideo) {
                            const updatedMeta = [
                                ...videoMeta,
                                ...files.map(() => ({
                                    category: "",
                                })),
                            ];

                            onVideoMetaChange?.(
                                updatedMeta
                            );
                        }
                    } else {
                        onChange(files[0] ?? null);

                        if (isVideo) {
                            onVideoMetaChange?.([
                                {
                                    category: "",
                                },
                            ]);
                        }
                    }

                    e.target.value = "";
                }}
            />

            {hasPreview && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {previewUrls.map(
                        (url, index) => {
                            return (
                                <div
                                    key={index}
                                    className="relative shrink-0"
                                >
                                    {isVideo ? (
                                        <div className="w-48">
                                            <div className="relative">
                                                <video
                                                    controls
                                                    className="w-48 h-40 rounded-xl border object-cover bg-black"
                                                >
                                                    <source
                                                        src={url}
                                                    />
                                                    Your browser does not support video playback.
                                                </video>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemove(
                                                            index
                                                        )
                                                    }
                                                    className="absolute top-1 right-1 w-6 h-6 cursor-pointer rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                                >
                                                    <X
                                                        size={14}
                                                    />
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                value={
                                                    videoMeta[
                                                        index
                                                    ]?.category ||
                                                    ""
                                                }
                                                onChange={(e) =>
                                                    handleCategoryChange(
                                                        index,
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter video category"
                                                className="w-full mt-2 px-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-[#3A29AA] focus:ring-1 focus:ring-[#3A29AA]"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <CustomImage
                                                src={url}
                                                alt={`preview-${index}`}
                                                className="w-35 h-35 rounded-xl border object-cover"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemove(
                                                        index
                                                    )
                                                }
                                                className="absolute top-1 right-1 w-5 h-5 cursor-pointer rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                            >
                                                <X
                                                    size={14}
                                                />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        }
                    )}
                </div>
            )}
        </div>
    );
}