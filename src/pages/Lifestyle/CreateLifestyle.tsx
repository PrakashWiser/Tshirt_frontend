import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { createLifestyle, updateLifestyle } from "../../store/slice/lifestyleSlice";
import type { Lifestyle } from "../../store/slice/lifestyleSlice";
import Button from "../../components/Button";
import CustomImage from "../../components/Image";

interface CreateLifestyleProps {
    selectedLifestyle?: Lifestyle | null;
    onClose: () => void;
}

export default function CreateLifestyle({ selectedLifestyle, onClose }: CreateLifestyleProps) {
    const dispatch = useAppDispatch();
    const { isCreating, isUpdating } = useAppSelector((state) => state.lifestyle);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "Active" as "Active" | "Inactive",
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (selectedLifestyle) {
            setFormData({
                name: selectedLifestyle.name,
                description: selectedLifestyle.description || "",
                status: selectedLifestyle.status,
            });
            if (selectedLifestyle.image) {
                setImagePreview(selectedLifestyle.image);
            }
        }
    }, [selectedLifestyle]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) {
            newErrors.name = "Lifestyle name is required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const multipartData = new FormData();
        multipartData.append("name", formData.name.trim());
        multipartData.append("description", formData.description.trim());
        multipartData.append("lifeStyle", formData.status);

        if (imageFile) {
            multipartData.append("lifeStyleImage", imageFile);
        }

        try {
            if (selectedLifestyle) {
                await dispatch(
                    updateLifestyle({
                        id: selectedLifestyle._id,
                        data: multipartData,
                    })
                ).unwrap();
            } else {
                await dispatch(createLifestyle(multipartData)).unwrap();
            }
            onClose();
        } catch (error) {
            console.error("Failed to save lifestyle:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-semibold text-slate-900">
                        {selectedLifestyle ? "Edit Lifestyle" : "Create New Lifestyle"}
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
                            Lifestyle Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter lifestyle name (e.g., Family, Work)"
                            className={`w-full border border-slate-200 rounded-md p-2 ${errors.name ? "border-red-500" : ""}`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter description"
                            rows={3}
                            className="w-full border border-slate-200 rounded-md p-2"
                        />
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
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Lifestyle Image
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center hover:border-black transition-colors bg-slate-50">
                                    {imagePreview ? (
                                        <CustomImage
                                            src={imagePreview}
                                            alt="Image preview"
                                            className="w-full h-full object-contain p-2"
                                        />
                                    ) : (
                                        <>
                                            <Upload size={24} className="text-slate-400" />
                                            <span className="text-xs text-slate-500 mt-1">Upload Image</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-500">
                                    Upload an image for the lifestyle. Recommended size: 400x400px.
                                </p>
                                {imageFile && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Selected: {imageFile.name}
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
                            className="px-6 py-2 text-white"
                            disabled={isCreating || isUpdating}
                        >
                            {isCreating || isUpdating
                                ? "Saving..."
                                : selectedLifestyle
                                    ? "Update Lifestyle"
                                    : "Create Lifestyle"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}