import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { createAmenity, updateAmenity } from "../../store/slice/premiumAmenitySlice";
import type { PremiumAmenity } from "../../store/slice/premiumAmenitySlice";

import Button from "../../components/Button";
import CustomImage from "../../components/Image";

interface CreateAmenityProps {
    selectedAmenity?: PremiumAmenity | null;
    onClose: () => void;
}

export default function CreateAmenity({ selectedAmenity, onClose }: CreateAmenityProps) {
    const dispatch = useAppDispatch();
    const { isCreating, isUpdating } = useAppSelector((state) => state.premiumAmenities);

    const [formData, setFormData] = useState({
        name: "",
        status: 1,
        icon: "",
    });

    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (selectedAmenity) {
            setFormData({
                name: selectedAmenity.name,
                status: Number(selectedAmenity.status),
                icon: selectedAmenity.icon || "",
            });
            if (selectedAmenity.icon) {
                setIconPreview(selectedAmenity.icon);
            }
        }
    }, [selectedAmenity]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "status"
                    ? Number(value) as 0 | 1
                    : type === "number"
                        ? Number(value)
                        : value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIconFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setIconPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };
    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            newErrors.name = "Amenity name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        const multipartData = new FormData();
        multipartData.append("name", formData.name.trim());
        multipartData.append("status", String(formData.status));

        if (iconFile) {
            multipartData.append("premiumAmenities_icon", iconFile);
        }

        try {
            if (selectedAmenity) {
                await dispatch(
                    updateAmenity({
                        id: selectedAmenity._id,
                        data: multipartData,
                    })
                ).unwrap();
            } else {
                await dispatch(
                    createAmenity(multipartData)
                ).unwrap();
            }

            onClose();
        } catch (error) {
            console.error("Failed to save amenity:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {selectedAmenity ? "Edit Amenity" : "Create New Amenity"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Amenity Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter amenity name (e.g., Swimming Pool)"
                            className={`w-full border border-slate-200 rounded-md p-2 ${errors.name ? "border-red-500" : ""}`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                        >
                            <option value={1}>Active</option>
                            <option value={0}>Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Amenity Icon
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleIconChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-black transition-colors bg-slate-50">
                                    {iconPreview ? (
                                        <CustomImage
                                            src={iconPreview}
                                            alt="Icon preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                    ) : (
                                        <>
                                            <Upload size={24} className="text-slate-400" />
                                            <span className="text-xs text-slate-500 mt-1">Upload Icon</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500">
                                    Upload an icon image for the amenity. Recommended size: 64x64px or 128x128px.
                                </p>
                                {iconFile && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Selected: {iconFile.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="px-6 py-2"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-6 py-2  text-white"
                            disabled={isCreating || isUpdating}
                        >
                            {isCreating || isUpdating
                                ? "Saving..."
                                : selectedAmenity
                                    ? "Update Amenity"
                                    : "Create Amenity"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}