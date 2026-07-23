import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../components/Taple";
import type { ColumnDef } from "../../components/Types";
import Button from "../../components/Button";
import { Download, UserPlus, X, Eye, EyeOff } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
    getVendors,
    deleteVendor,
    approveVendor,
    rejectVendor,
    suspendVendor,
    activateVendor,
    resetVendorPassword,
    clearVendorError,
} from "../../store/slice/vendorSlice";
import { addToast } from "../../store/slice/uiSlice";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import DotMenu from "../../components/DotMenu";
import { exportTableData } from "../../utils/exportToExcel";
import CreateVendor from "./CreateVendor";
import { useNavigate } from "react-router-dom";

interface VendorRow {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    vendorProfile: {
        businessName: string;
        gstNumber: string;
        panNumber: string;
        approvalStatus: "pending" | "approved" | "rejected" | "suspended";
        bankDetails: {
            accountNo: string;
            ifsc: string;
            bankName: string;
            accountHolderName: string;
        };
        permissions: { granted: boolean; id: string; name: string }[];
    };
    createdAt: string;
    updatedAt: string;
}

export default function VendorsSection() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { error, message, vendors, isLoading } = useAppSelector((state) => state.vendor);
    const [openCreate, setOpenCreate] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState(false);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isSubmittingReject, setIsSubmittingReject] = useState(false);
    const [resetPasswordModal, setResetPasswordModal] = useState(false);
    const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmittingReset, setIsSubmittingReset] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

    useEffect(() => {
        dispatch(getVendors());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getVendors());
            setOpenCreate(false);
            setSelectedVendor(null);
            dispatch(clearVendorError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearVendorError());
        }
    }, [message, error, dispatch]);

    const handleEdit = (vendor: any) => {
        setSelectedVendor(vendor);
        setOpenCreate(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;
        dispatch(deleteVendor(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };

    const handleApprove = (id: string) => dispatch(approveVendor(id));
    const handleSuspend = (id: string) => dispatch(suspendVendor(id));
    const handleActivate = (id: string) => dispatch(activateVendor(id));

    const handleRejectClick = (id: string) => {
        setRejectId(id);
        setRejectReason("");
        setRejectModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!rejectId || !rejectReason.trim()) {
            if (!rejectReason.trim()) {
                dispatch(addToast({ type: "error", text: "Please provide a reason for rejection" }));
            }
            return;
        }
        setIsSubmittingReject(true);
        try {
            await dispatch(rejectVendor({ id: rejectId, reason: rejectReason }) as any);
            setRejectModal(false);
            setRejectId(null);
            setRejectReason("");
        } catch (error) {
            console.error("Reject error:", error);
        } finally {
            setIsSubmittingReject(false);
        }
    };

    const handleResetPasswordClick = (id: string) => {
        setResetPasswordId(id);
        setNewPassword("");
        setConfirmPassword("");
        setPasswordErrors({});
        setResetPasswordModal(true);
    };

    const validatePassword = () => {
        const errors: { newPassword?: string; confirmPassword?: string } = {};
        if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
        else if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleResetPasswordConfirm = async () => {
        if (!resetPasswordId || !validatePassword()) return;
        setIsSubmittingReset(true);
        try {
            await dispatch(resetVendorPassword({ id: resetPasswordId, newPassword }) as any);
            setResetPasswordModal(false);
            setResetPasswordId(null);
            setNewPassword("");
            setConfirmPassword("");
            setPasswordErrors({});
            dispatch(addToast({ type: "success", text: "Password reset successfully" }));
        } catch (error) {
            console.error("Reset password error:", error);
        } finally {
            setIsSubmittingReset(false);
        }
    };

    const handleExport = () => {
        const exportColumns = columns.filter(col => col.key !== 'actions');
        exportTableData(vendorData as VendorRow[], exportColumns, "Vendors");
    };

    const columns = useMemo<ColumnDef<VendorRow>[]>(() => [
        {
            key: "vendorId",
            header: "VENDOR ID",
            accessor: "_id",
            render: (value) => (
                <span className="text-xs font-mono text-slate-500">
                    {String(value).slice(-8).toUpperCase()}
                </span>
            ),
            sortable: true,
        },
        {
            key: "businessName",
            header: "BUSINESS",
            accessor: "vendorProfile",
            render: (_, row) => (
                <div>
                    <p className="font-medium">{row.vendorProfile?.businessName || row.name}</p>
                    <p className="text-xs text-slate-400">{row.name}</p>
                </div>
            ),
            sortable: true,
        },
        {
            key: "contact",
            header: "CONTACT",
            accessor: "email",
            render: (_, row) => (
                <div>
                    <p className="text-sm">{row.email}</p>
                    <p className="text-xs text-slate-400">{row.phone}</p>
                </div>
            ),
        },
        {
            key: "gstNumber",
            header: "GST/PAN",
            accessor: "vendorProfile",
            render: (_, row) => (
                <div>
                    <p className="text-xs">GST: {row.vendorProfile?.gstNumber || 'N/A'}</p>
                    <p className="text-xs text-slate-400">PAN: {row.vendorProfile?.panNumber || 'N/A'}</p>
                </div>
            ),
        },
        {
            key: "approvalStatus",
            header: "STATUS",
            accessor: "vendorProfile",
            render: (_, row) => {
                const status = row.vendorProfile?.approvalStatus || 'pending';
                const colors: Record<string, string> = {
                    pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
                    approved: "bg-green-100 text-green-700 border border-green-200",
                    active: "bg-emerald-100 text-emerald-700 border border-emerald-200",
                    rejected: "bg-red-100 text-red-700 border border-red-200",
                    suspended: "bg-orange-100 text-orange-700 border border-orange-200",
                };
                return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            key: "permissions",
            header: "PERMISSIONS",
            accessor: "vendorProfile",
            render: (_, row) => (
                <span className="text-sm text-slate-600">
                    {row.vendorProfile?.permissions?.length || 0} granted
                </span>
            ),
        },
        {
            key: "createdAt",
            header: "JOINED",
            accessor: "createdAt",
            render: (value) => {
                const date = value ? new Date(value as string) : null;
                return date ? date.toLocaleDateString("en-IN") : "-";
            },
            sortable: true,
        },
        {
            key: "actions",
            header: "ACTIONS",
            accessor: "_id",
            render: (_, row: any) => {
                const status = row?.vendorProfile?.approvalStatus?.toLowerCase();
                return (
                    <DotMenu

                        onEdit={() => handleEdit(row)}
                        onApprove={status === "pending" ? () => handleApprove(row._id) : undefined}
                        onReject={status === "pending" ? () => handleRejectClick(row._id) : undefined}
                        onSuspend={status === "active" || status === "approved" ? () => handleSuspend(row._id) : undefined}
                        onActivate={status === "suspended" ? () => handleActivate(row._id) : undefined}
                        onResetPassword={() => handleResetPasswordClick(row._id)}
                        onDelete={() => handleDelete(row._id)}
                    />
                );
            },
        }
    ], []);

    const vendorData = useMemo(() =>
        (vendors || []).map((vendor: any) => ({
            ...vendor,
            _id: vendor._id || vendor.id,
            vendorProfile: vendor.vendorProfile || {},
        })),
        [vendors]
    );

    const RejectModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Reject Vendor</h3>
                    <button onClick={() => { setRejectModal(false); setRejectId(null); setRejectReason(""); }} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Please provide a reason for rejecting this vendor application.</p>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Rejection Reason <span className="text-red-500">*</span></label>
                        <textarea rows={4} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Enter the reason for rejection..." className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none" autoFocus />
                        {!rejectReason.trim() && <p className="mt-1 text-xs text-red-500">Please provide a reason</p>}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                    <Button variant="outline" onClick={() => { setRejectModal(false); setRejectId(null); setRejectReason(""); }} className="px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50">Cancel</Button>
                    <Button onClick={handleRejectConfirm} disabled={isSubmittingReject || !rejectReason.trim()} className="flex items-center gap-2 px-4 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">
                        {isSubmittingReject ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Rejecting...</> : "Reject Vendor"}
                    </Button>
                </div>
            </div>
        </div>
    );

    const ResetPasswordModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Reset Password</h3>
                    <button onClick={() => { setResetPasswordModal(false); setResetPasswordId(null); setNewPassword(""); setConfirmPassword(""); setPasswordErrors({}); }} className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">Enter a new password for this vendor account.</p>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); if (passwordErrors.newPassword) setPasswordErrors({ ...passwordErrors, newPassword: undefined }); }} placeholder="Enter new password" className={`w-full rounded-lg border ${passwordErrors.newPassword ? 'border-red-500' : 'border-slate-200'} px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} autoFocus />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>}
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (passwordErrors.confirmPassword) setPasswordErrors({ ...passwordErrors, confirmPassword: undefined }); }} placeholder="Confirm new password" className={`w-full rounded-lg border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-slate-200'} px-4 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {passwordErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.confirmPassword}</p>}
                        {confirmPassword && newPassword && newPassword === confirmPassword && <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>}
                    </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200">
                    <Button variant="outline" onClick={() => { setResetPasswordModal(false); setResetPasswordId(null); setNewPassword(""); setConfirmPassword(""); setPasswordErrors({}); }} className="px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50">Cancel</Button>
                    <Button onClick={handleResetPasswordConfirm} disabled={isSubmittingReset || !newPassword || !confirmPassword} className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed">
                        {isSubmittingReset ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Resetting...</> : "Reset Password"}
                    </Button>
                </div>
            </div>
        </div>
    );

    if (openCreate) {
        return <CreateVendor onClose={() => { setOpenCreate(false); setSelectedVendor(null); }} selectedVendor={selectedVendor} />;
    }

    return (
        <>
            <div className="py-4">
                <DataTable<VendorRow>
                    onRowClick={(row: any) => navigate(`/vendor/${row._id}`)}
                    data={vendorData}
                    columns={columns}
                    rowKey="_id"
                    searchKeys={["_id", "name", "email", "phone"]}
                    loading={isLoading}
                    actions={
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={handleExport} className="flex items-center gap-2 px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50">
                                <Download size={16} /> Export
                            </Button>
                            <Button onClick={() => { setSelectedVendor(null); setOpenCreate(true); }} className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-xs font-medium">
                                <UserPlus size={16} /> Add Vendor
                            </Button>
                        </div>
                    }
                    searchPlaceholder="Search vendors..."
                    defaultView="table"
                    pageSize={10}
                    stickyHeader
                />
            </div>

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this vendor?"
                onConfirm={confirmDelete}
                onCancel={() => { setDeleteModal(false); setDeleteId(null); }}
            />

            {rejectModal && <RejectModal />}
            {resetPasswordModal && <ResetPasswordModal />}
        </>
    );
}