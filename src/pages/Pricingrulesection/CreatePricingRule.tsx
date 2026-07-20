import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { createPricingRule, updatePricingRule } from "../../store/slice/pricingRuleSlice";
import { getAllProperties } from "../../store/slice/propertySlice";
import { getAllRooms } from "../../store/slice/roomSlice";
import type { PricingRule } from "../../types";
import InputField from "../../components/CommonInput";
import TagInput from "../../components/Taginput";
import Button from "../../components/Button";

interface CreatePricingRuleProps {
    selectedRule?: PricingRule | null;
    onClose: () => void;
    loading?: boolean;
}

const DAY_LABEL_TO_NUM: Record<string, number> = {
    Sunday: 0, Monday: 1, Tuesday: 2,
    Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

const DAY_NUM_TO_LABEL: Record<number, string> = Object.fromEntries(
    Object.entries(DAY_LABEL_TO_NUM).map(([k, v]) => [v, k])
);

export default function CreatePricingRule({
    selectedRule,
    onClose,
    loading = false,
}: CreatePricingRuleProps) {
    const dispatch = useAppDispatch();
    const { properties } = useAppSelector((state) => state.property);
    const { rooms } = useAppSelector((state) => state.rooms);

    useEffect(() => {
        dispatch(getAllProperties());
        dispatch(getAllRooms());
    }, [dispatch]);

    const [formData, setFormData] = useState({
        title: "",
        scope: "global" as "global" | "property" | "room",
        ruleType: "day_of_week" as string,
        adjustmentType: "percentage" as "percentage" | "fixed",
        operation: "increase" as "increase" | "decrease",
        value: "",
        priority: 1,
        propertyId: "",
        roomId: "",
        daysOfWeek: [] as string[],
        startDate: "",
        endDate: "",
    });



    useEffect(() => {
        if (selectedRule) {
            const initialData = {
                title: selectedRule.title || "",
                scope: selectedRule.scope || "global",
                ruleType: selectedRule.ruleType || "day_of_week",
                adjustmentType: selectedRule.adjustmentType || "percentage",
                operation: selectedRule.operation || "increase",
                value: selectedRule.value?.toString() || "",
                priority: selectedRule.priority || 1,
                propertyId:
                    typeof selectedRule.propertyId === "string"
                        ? selectedRule.propertyId
                        : selectedRule.propertyId?._id || "",

                roomId:
                    typeof selectedRule.roomId === "string"
                        ? selectedRule.roomId
                        : selectedRule.roomId?._id || "",
                daysOfWeek: selectedRule.daysOfWeek?.map((d: number) => DAY_NUM_TO_LABEL[d]).filter(Boolean) || [],
                startDate: selectedRule.startDate ? selectedRule.startDate.split("T")[0] : "",
                endDate: selectedRule.endDate ? selectedRule.endDate.split("T")[0] : "",
            };
            setFormData(initialData);
        } else {
            setFormData({
                title: "",
                scope: "global",
                ruleType: "day_of_week",
                adjustmentType: "percentage",
                operation: "increase",
                value: "",
                priority: 1,
                propertyId: "",
                roomId: "",
                daysOfWeek: [],
                startDate: "",
                endDate: "",
            });
        }
    }, [selectedRule]);

    const handleScopeChange = (newScope: "global" | "property" | "room") => {
        setFormData(prev => ({
            ...prev,
            scope: newScope,
            propertyId: newScope === "global" ? "" : prev.propertyId,
            roomId: "",
        }));
    };

    const handlePropertyChange = (propertyId: string) => {
        setFormData(prev => ({
            ...prev,
            propertyId,
            roomId: "",
        }));
    };

    const handleChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            alert("Title is required");
            return;
        }
        if (!formData.value || isNaN(Number(formData.value))) {
            alert("Valid adjustment value is required");
            return;
        }
        if (formData.scope === "property" && !formData.propertyId) {
            alert("Property is required");
            return;
        }
        if (formData.scope === "room" && !formData.roomId) {
            alert("Room is required");
            return;
        }
        if (formData.ruleType === "date_range" && (!formData.startDate || !formData.endDate)) {
            alert("Start and End dates are required");
            return;
        }
        if (formData.ruleType === "day_of_week" && formData.daysOfWeek.length === 0) {
            alert("At least one day must be selected");
            return;
        }

        const payload: any = {
            title: formData.title.trim(),
            scope: formData.scope,
            ruleType: formData.ruleType,
            adjustmentType: formData.adjustmentType,
            operation: formData.operation,
            value: Number(formData.value),
            priority: Number(formData.priority || 1),
        };

        if (formData.scope === "property" || (formData.scope === "room" && formData.propertyId)) {
            payload.propertyId = formData.propertyId;
        }
        if (formData.scope === "room") {
            payload.roomId = formData.roomId;
        }

        if (formData.ruleType === "date_range") {
            payload.startDate = formData.startDate;
            payload.endDate = formData.endDate;
        }

        if (formData.ruleType === "day_of_week") {
            payload.daysOfWeek = formData.daysOfWeek
                .map(d => DAY_LABEL_TO_NUM[d])
                .filter((n): n is number => n !== undefined);
        }

        if (selectedRule?._id) {
            dispatch(updatePricingRule({ id: selectedRule._id, data: payload }));
        } else {
            dispatch(createPricingRule(payload));
        }

        onClose();
    };


    return (
        <div className="p-6">
            <form
                onSubmit={handleSubmit}
                className="bg-white border border-slate-200 rounded-2xl p-6"
            >
                <h2 className="text-xl font-semibold mb-6">
                    {selectedRule ? "Edit Pricing Rule" : "Create Pricing Rule"}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Rule Title <span className="text-red-500">*</span>
                        </label>
                        <InputField
                            type="text"
                            placeholder="e.g. Weekend Price Increase"
                            value={formData.title}
                            onChange={(e) => handleChange("title", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Scope <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.scope}
                            onChange={(e) => handleScopeChange(e.target.value as any)}
                            className="w-full border border-slate-200 rounded-sm px-4 py-2 outline-0 text-sm"
                        >
                            <option value="global">Global</option>
                            <option value="property">Property</option>
                            <option value="room">Room</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Rule Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.ruleType}
                            onChange={(e) => handleChange("ruleType", e.target.value)}
                            className="w-full border border-slate-200 rounded-sm px-4 py-2 outline-0 text-sm"
                        >
                            <option value="day_of_week">Day of Week</option>
                            <option value="date_range">Date Range</option>
                            <option value="occupancy">Occupancy</option>
                            <option value="last_minute">Last Minute</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Adjustment Type <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.adjustmentType}
                            onChange={(e) => handleChange("adjustmentType", e.target.value)}
                            className="w-full border border-slate-200 rounded-sm px-4 py-2 outline-0 text-sm"
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount (₹)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Operation <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.operation}
                            onChange={(e) => handleChange("operation", e.target.value)}
                            className="w-full border border-slate-200 rounded-sm px-4 py-2 outline-0 text-sm"
                        >
                            <option value="increase">↑ Increase</option>
                            <option value="decrease">↓ Decrease</option>
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">
                            Adjustment Value <span className="text-red-500">*</span>
                        </label>
                        <InputField
                            type="number"
                            placeholder="e.g. 20 for 20% or 500 for ₹500"
                            value={formData.value}
                            onChange={(e) => handleChange("value", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-slate-700">Priority</label>
                        <InputField
                            type="number"
                            placeholder="Higher number = applied first"
                            value={formData.priority}
                            onChange={(e) => handleChange("priority", parseInt(e.target.value) || 1)}
                        />
                    </div>

                    {formData.scope === "property" && (
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Property <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.propertyId}
                                onChange={(e) => handlePropertyChange(e.target.value)}
                                className="w-full border border-slate-200 rounded-sm px-4 py-2 outline-0 text-sm"
                            >
                                <option value="">Select Property</option>
                                {properties?.map((p: any) => (
                                    <option key={p._id} value={p._id}>
                                        {p.propertyName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.scope === "room" && (
                        <div>
                            <label className="block mb-2 text-sm font-medium text-slate-700">
                                Room <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.roomId}
                                onChange={(e) => handleChange("roomId", e.target.value)}
                                className="w-full border border-slate-200 rounded-sm px-4 py-2 outline-0 text-sm"
                            >
                                <option value="">Select Room</option>
                                {rooms?.map((r: any) => (
                                    <option key={r._id} value={r._id}>
                                        {r.roomName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.ruleType === "day_of_week" && (
                        <div className="md:col-span-2">
                            <TagInput
                                label="Days of Week"
                                value={formData.daysOfWeek}
                                onChange={(tags) => handleChange("daysOfWeek", tags)}
                                placeholder="Select days this rule applies..."
                                suggestions={Object.keys(DAY_LABEL_TO_NUM)}
                                required
                            />
                        </div>
                    )}

                    {formData.ruleType === "date_range" && (
                        <>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <InputField
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange("startDate", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-slate-700">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <InputField
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => handleChange("endDate", e.target.value)}
                                />
                            </div>
                        </>
                    )}
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
                            selectedRule ? "Update Rule" : "Create Rule"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}