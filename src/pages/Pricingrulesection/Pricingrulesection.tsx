import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Tag } from "lucide-react";
import { DataTable } from "../../components/Taple";
import DotMenu from "../../components/DotMenu";
import Button from "../../components/Button";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import CreatePricingRule from "./CreatePricingRule";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearPricingRuleError,
    deletePricingRule,
    getAllPricingRules,
    updatePricingRuleStatus,
} from "../../store/slice/pricingRuleSlice";
import type { PricingRule } from "../../types";
import { exportTableData } from "../../utils/exportToExcel";
import { usePermission } from "../../hooks/usePermission";


const SCOPE_COLOR: Record<string, string> = {
    global: "bg-purple-100 text-purple-700",
    property: "bg-blue-100 text-blue-700",
    room: "bg-amber-100 text-amber-700",
};

const OPERATION_LABEL: Record<string, string> = {
    add: "↑ Increase",
    subtract: "↓ Decrease",
};


const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function PricingRuleSection() {
    const dispatch = useAppDispatch();
    const { hasPermission } = usePermission();
    const [openForm, setOpenForm] = useState(false);
    const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { pricingRules, isLoading, message, error } = useAppSelector(
        (state) => state.pricingRule
    );

    useEffect(() => {
        dispatch(getAllPricingRules());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllPricingRules());
            setSelectedRule(null);
            setOpenForm(false);
            dispatch(clearPricingRuleError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearPricingRuleError());
        }
    }, [message, error, dispatch]);

    const columns = useMemo<import("../../components/Types").ColumnDef < PricingRule >[]>(
        () => [
            { key: "title", header: "Title", accessor: "title" },
            { key: "ruleType", header: "Type", accessor: "ruleType" },
            { key: "scope", header: "Scope", accessor: "scope" },
            { key: "value", header: "Value", accessor: "value" },
            { key: "priority", header: "Priority", accessor: "priority" },
            {
                key: "status",
                header: "Status",
                accessor: (row) => (row.isActive ? "Active" : "Inactive"),
            },
        ],
        []
    );

    const handleExport = () => {
        exportTableData(
            pricingRules,
            columns,
            "PricingRules"
        );
    };


    const handleEdit = (rule: PricingRule) => {
        setSelectedRule(rule);
        setOpenForm(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        dispatch(deletePricingRule(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };

    const toggleStatus = (rule: PricingRule) => {
        dispatch(
            updatePricingRuleStatus({
                id: rule._id,
                isActive: !rule.isActive,
            })
        );
    };
    if (openForm) {
        return (
            <CreatePricingRule
                selectedRule={selectedRule}
                loading={isLoading}
                onClose={() => { setSelectedRule(null); setOpenForm(false); }}
            />
        );
    }

    return (
        <>
            <DataTable<PricingRule>
                data={pricingRules}
                columns={columns}
                rowKey="_id"
                defaultView="grid"
                pageSize={9}
                searchKeys={["title", "ruleType", "scope"]}
                searchPlaceholder="Search pricing rules..."
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2 px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
                            onClick={handleExport}
                        >
                            <Download size={16} />
                            Export
                        </Button>
                        {hasPermission("pricing_rules.create") && (
                            <Button
                                onClick={() => { setSelectedRule(null); setOpenForm(true); }}
                                className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-xs font-medium"
                            >
                                <Plus size={16} />
                                Add Rule
                            </Button>)}
                    </div>
                }
                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                renderGridCard={(rule) => (
                    <div key={rule._id} className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-xl bg-slate-100">
                                    <Tag size={16} className="text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-sm leading-tight">{rule.title}</h3>
                                    <p className="text-xs text-slate-400 capitalize mt-0.5">{rule.ruleType.replace("_", " ")}</p>
                                </div>
                            </div>
                            <DotMenu
                                showEdit={hasPermission("pricing_rules.update")}
                                showDelete={hasPermission("pricing_rules.delete")}
                                onEdit={() => handleEdit(rule)}
                                onDelete={() => handleDelete(rule._id)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${SCOPE_COLOR[rule.scope] || "bg-slate-100 text-slate-600"}`}>
                                {rule.scope}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                                {OPERATION_LABEL[rule.operation] || rule.operation}{" "}
                                {rule.adjustmentType === "percentage" ? `${rule.value}%` : `₹${rule.value}`}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                                Priority {rule.priority}
                            </span>
                        </div>

                        {rule.daysOfWeek && rule.daysOfWeek.length > 0 && (
                            <div className="flex gap-1">
                                {DAY_LABELS.map((day, i) => (
                                    <span
                                        key={day}
                                        className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-medium transition-colors ${rule.daysOfWeek!.includes(i)
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-400"
                                            }`}
                                    >
                                        {day[0]}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span
                                className={`text-xs font-medium ${rule.isActive ? "text-green-600" : "text-slate-400"
                                    }`}
                            >
                                {rule.isActive ? "Active" : "Inactive"}
                            </span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={rule.isActive}
                                onClick={() => toggleStatus(rule)}
                                className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${rule.isActive ? "bg-slate-800" : "bg-slate-200"
                                    }`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${rule.isActive ? "translate-x-4" : "translate-x-0"
                                        }`}
                                />
                            </button>
                        </div>
                    </div >
                )
                }
            />
            < ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this pricing rule?"
                onConfirm={confirmDelete}
                onCancel={() => { setDeleteModal(false); setDeleteId(null); }}
            />
        </>
    );
}