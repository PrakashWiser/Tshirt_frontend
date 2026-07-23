import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    User,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Shield,
    Trash2,
    CalendarClock,
    Award,
    Play,
    Pause,
    ThumbsUp,
    ThumbsDown,
    Landmark,
    Loader2,
} from "lucide-react";
import Button from "../../components/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
    getVendorById,
    approveVendor,
    rejectVendor,
    suspendVendor,
    activateVendor,
    clearVendorError,
    clearVendorData,
} from "../../store/slice/vendorSlice";
import { addToast } from "../../store/slice/uiSlice";
import CustomImage from "../../components/Image";

interface BankDetails {
    accountNo: string;
    ifsc: string;
    bankName: string;
    accountHolderName: string;
}

interface VendorProfile {
    bankDetails: BankDetails;
    businessName: string;
    gstNumber: string;
    panNumber: string;
    approvalStatus: "pending" | "approved" | "rejected" | "suspended";
    approvedBy: string | null;
    approvedAt: string | null;
    rejectionReason: string;
    suspendedAt: string | null;
    permissions: string[];
    documents: any[];
}

interface VendorData {
    _id: string;
    name: string;
    email: string;
    phone: string;
    loginMethod: string;
    role: string;
    adminRole: string | null;
    avatar: string;
    isVerified: boolean;
    isActive: boolean;
    isDeleted: boolean;
    lastLoginAt: string | null;
    vendorProfile: VendorProfile;
    addresses: any[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

function DetailSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-9 w-40 bg-slate-200 rounded-lg" />
            <div className="h-32 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl" />
                <div className="h-96 bg-slate-200 rounded-2xl" />
            </div>
        </div>
    );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">{title}</h3>
            {children}
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-2.5 text-sm border-b border-slate-100 last:border-b-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-900 text-right">{value}</span>
        </div>
    );
}

function formatDateTime(value?: string): string {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
}

function toTitleCase(value: string): string {
    return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
        pending: {
            color: "bg-yellow-100 text-yellow-700 border-yellow-200",
            label: "Pending",
            icon: <Clock size={12} />
        },
        approved: {
            color: "bg-green-100 text-green-700 border-green-200",
            label: "Approved",
            icon: <CheckCircle2 size={12} />
        },
        rejected: {
            color: "bg-red-100 text-red-700 border-red-200",
            label: "Rejected",
            icon: <XCircle size={12} />
        },
        suspended: {
            color: "bg-orange-100 text-orange-700 border-orange-200",
            label: "Suspended",
            icon: <Pause size={12} />
        },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            {config.icon}
            {config.label}
        </span>
    );
}

function PermissionTag({ permission }: { permission: string }) {
    const categoryMap: Record<string, string> = {
        dashboard: "Dashboard",
        properties: "Properties",
        rooms: "Rooms",
        pricing: "Pricing",
        bookings: "Bookings",
        vendors: "Vendors",
        users: "Users",
        reports: "Reports",
        settings: "Settings",
    };

    const category = permission.split('.')[0] || "other";
    const displayName = permission.split('.').pop()?.toUpperCase() || permission;
    const categoryLabel = categoryMap[category] || category;

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
            <span className="font-medium text-slate-700">{displayName}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">{categoryLabel}</span>
        </div>
    );
}

function LoadingButton({ loading, children, ...props }: { loading: boolean; children: React.ReactNode;[key: string]: any }) {
    return (
        <Button disabled={loading} {...props}>
            {loading ? (
                <span className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Loading...
                </span>
            ) : (
                children
            )}
        </Button>
    );
}

function CustomModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
                    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <XCircle size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function VendorDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { vendor, isLoading, error, message } = useAppSelector(
        (state) => state.vendor,
    );

    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const vendorData = vendor as unknown as VendorData | null;

    useEffect(() => {
        if (id) {
            dispatch(getVendorById(id));
        }

        return () => {
            dispatch(clearVendorData());
        };
    }, [dispatch, id]);

    useEffect(() => {
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearVendorError());
        }
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
        }
    }, [error, message, dispatch]);

    const handleApprove = async () => {
        if (!id) return;
        setActionLoading("approve");
        try {
            await dispatch(approveVendor(id)).unwrap();
            dispatch(addToast({ type: "success", text: "Vendor approved successfully" }));
        } catch (err: any) {
            dispatch(addToast({ type: "error", text: err || "Failed to approve vendor" }));
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async () => {
        if (!id || !rejectReason.trim()) return;
        setActionLoading("reject");
        try {
            await dispatch(rejectVendor({ id, reason: rejectReason.trim() })).unwrap();
            dispatch(addToast({ type: "success", text: "Vendor rejected successfully" }));
            setShowRejectModal(false);
            setRejectReason("");
        } catch (err: any) {
            dispatch(addToast({ type: "error", text: err || "Failed to reject vendor" }));
        } finally {
            setActionLoading(null);
        }
    };

    const handleSuspend = async () => {
        if (!id) return;
        setActionLoading("suspend");
        try {
            await dispatch(suspendVendor(id)).unwrap();
            dispatch(addToast({ type: "success", text: "Vendor suspended successfully" }));
        } catch (err: any) {
            dispatch(addToast({ type: "error", text: err || "Failed to suspend vendor" }));
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivate = async () => {
        if (!id) return;
        setActionLoading("activate");
        try {
            await dispatch(activateVendor(id)).unwrap();
            dispatch(addToast({ type: "success", text: "Vendor activated successfully" }));
        } catch (err: any) {
            dispatch(addToast({ type: "error", text: err || "Failed to activate vendor" }));
        } finally {
            setActionLoading(null);
        }
    };



    const handleDelete = async () => {
        setActionLoading("delete");
        try {
            dispatch(addToast({ type: "success", text: "Vendor deleted successfully" }));
            setShowDeleteModal(false);
            navigate("/vendors");
        } catch (err: any) {
            dispatch(addToast({ type: "error", text: err || "Failed to delete vendor" }));
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading && !vendorData) {
        return (
            <div className="p-1">
                <DetailSkeleton />
            </div>
        );
    }

    if (!isLoading && !vendorData) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <XCircle size={40} className="text-slate-300 mb-3" />
                <h2 className="text-lg font-semibold text-slate-800">
                    Vendor not found
                </h2>
                <p className="text-sm text-slate-500 mt-1 mb-5">
                    This vendor may have been deleted or the link is invalid.
                </p>
                <Button
                    onClick={() => navigate("/vendors")}
                    className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Vendors
                </Button>
            </div>
        );
    }

    const profile = vendorData?.vendorProfile;
    const bankDetails = profile?.bankDetails;
    const permissions = profile?.permissions || [];
    const approvalStatus = profile?.approvalStatus || "pending";
    const isActive = vendorData?.isActive ?? false;

    return (
        <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <button
                    onClick={() => navigate("/vendors")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Vendors
                </button>
                <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={approvalStatus} />
                    {isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
                            <CheckCircle2 size={12} />
                            Active
                        </span>
                    )}

                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-6 flex-wrap">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {vendorData?.avatar ? (
                            <CustomImage
                                src={vendorData.avatar}
                                alt={vendorData.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User size={32} className="text-slate-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">
                                    {vendorData?.name}
                                </h1>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1 flex-wrap">
                                    <Building2 size={14} />
                                    {profile?.businessName || "No business name"}
                                    <span className="w-px h-4 bg-slate-200" />
                                    <Mail size={14} />
                                    {vendorData?.email}
                                    <span className="w-px h-4 bg-slate-200" />
                                    <Phone size={14} />
                                    {vendorData?.phone}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {approvalStatus === "pending" && (
                                    <>
                                        <LoadingButton
                                            loading={actionLoading === "approve"}
                                            onClick={handleApprove}
                                            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ThumbsUp size={16} />
                                            Approve
                                        </LoadingButton>
                                        <LoadingButton
                                            loading={actionLoading === "reject"}
                                            onClick={() => setShowRejectModal(true)}
                                            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ThumbsDown size={16} />
                                            Reject
                                        </LoadingButton>
                                    </>
                                )}
                                {approvalStatus === "approved" && isActive && (
                                    <LoadingButton
                                        loading={actionLoading === "suspend"}
                                        onClick={handleSuspend}
                                        className="flex items-center gap-2 px-4 h-9 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Pause size={16} />
                                        Suspend
                                    </LoadingButton>
                                )}
                                {approvalStatus === "suspended" && (
                                    <LoadingButton
                                        loading={actionLoading === "activate"}
                                        onClick={handleActivate}
                                        className="flex items-center gap-2 px-4 h-9 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Play size={16} />
                                        Activate
                                    </LoadingButton>
                                )}
                                <LoadingButton
                                    loading={actionLoading === "delete"}
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-2 px-4 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </LoadingButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <div className="bg-blue-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Shield size={22} className="text-blue-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-blue-600">
                                {permissions.length}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Total Permissions</p>
                        </div>
                    </div>
                </div>
                <div className="bg-purple-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Award size={22} className="text-purple-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-purple-600">
                                {profile?.gstNumber || "N/A"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">GST Number</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 size={22} className="text-green-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-green-600">
                                {vendorData?.isVerified ? "Verified" : "Not Verified"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Verification Status</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <InfoCard title="Business Information">
                        <InfoRow
                            label="Vendor Name"
                            value={vendorData?.name || "—"}
                        />
                        <InfoRow
                            label="Business Name"
                            value={profile?.businessName || "—"}
                        />
                        <InfoRow
                            label="Email"
                            value={
                                <span className="flex items-center gap-1">
                                    <Mail size={14} />
                                    {vendorData?.email || "—"}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Phone"
                            value={
                                <span className="flex items-center gap-1">
                                    <Phone size={14} />
                                    {vendorData?.phone || "—"}
                                </span>
                            }
                        />
                        <InfoRow
                            label="GST Number"
                            value={profile?.gstNumber || "—"}
                        />
                        <InfoRow
                            label="PAN Number"
                            value={profile?.panNumber || "—"}
                        />
                        <InfoRow
                            label="Approval Status"
                            value={<StatusBadge status={approvalStatus} />}
                        />
                        <InfoRow
                            label="Account Status"
                            value={
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}>
                                    {isActive ? "Active" : "Inactive"}
                                </span>
                            }
                        />
                        {profile?.approvedAt && (
                            <InfoRow
                                label="Approved At"
                                value={formatDateTime(profile.approvedAt)}
                            />
                        )}
                        {profile?.suspendedAt && (
                            <InfoRow
                                label="Suspended At"
                                value={formatDateTime(profile.suspendedAt)}
                            />
                        )}
                        {profile?.rejectionReason && (
                            <InfoRow
                                label="Rejection Reason"
                                value={
                                    <span className="text-red-600 text-sm">
                                        {profile.rejectionReason}
                                    </span>
                                }
                            />
                        )}
                    </InfoCard>
                    <InfoCard title="Permissions">
                        {permissions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {permissions.map((permission) => (
                                    <PermissionTag key={permission} permission={permission} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">No permissions assigned</p>
                        )}
                    </InfoCard>




                </div>

                <div className="space-y-5">
                    <InfoCard title="Meta Information">
                        <InfoRow
                            label="User ID"
                            value={
                                <span className="font-mono text-xs">
                                    {vendorData?._id?.slice(-8) || "—"}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Role"
                            value={toTitleCase(vendorData?.role || "—")}
                        />
                        <InfoRow
                            label="Login Method"
                            value={toTitleCase(vendorData?.loginMethod || "—")}
                        />
                        <InfoRow
                            label="Verified"
                            value={
                                vendorData?.isVerified ? (
                                    <CheckCircle2 size={16} className="text-green-500" />
                                ) : (
                                    <XCircle size={16} className="text-red-400" />
                                )
                            }
                        />
                        <InfoRow
                            label="Created At"
                            value={
                                <span className="flex items-center gap-1">
                                    <CalendarClock size={14} />
                                    {formatDateTime(vendorData?.createdAt)}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Last Updated"
                            value={
                                <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {formatDateTime(vendorData?.updatedAt)}
                                </span>
                            }
                        />
                        {vendorData?.lastLoginAt && (
                            <InfoRow
                                label="Last Login"
                                value={formatDateTime(vendorData.lastLoginAt)}
                            />
                        )}
                    </InfoCard>
                    <InfoCard title="Bank Details">
                        <InfoRow
                            label="Account Holder Name"
                            value={bankDetails?.accountHolderName || "—"}
                        />
                        <InfoRow
                            label="Bank Name"
                            value={
                                <span className="flex items-center gap-1">
                                    <Landmark size={14} />
                                    {bankDetails?.bankName || "—"}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Account Number"
                            value={
                                <span className="font-mono text-sm">
                                    {bankDetails?.accountNo || "—"}
                                </span>
                            }
                        />
                        <InfoRow
                            label="IFSC Code"
                            value={
                                <span className="font-mono text-sm uppercase">
                                    {bankDetails?.ifsc || "—"}
                                </span>
                            }
                        />
                    </InfoCard>


                    {approvalStatus === "pending" && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-yellow-800">
                                        Pending Approval
                                    </h4>
                                    <p className="text-xs text-yellow-700 mt-1">
                                        This vendor is awaiting approval. Review their details and approve or reject.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {approvalStatus === "suspended" && (
                        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-orange-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-orange-800">
                                        Vendor Suspended
                                    </h4>
                                    <p className="text-xs text-orange-700 mt-1">
                                        This vendor is currently suspended. Activate to restore access.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {approvalStatus === "rejected" && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-800">
                                        Vendor Rejected
                                    </h4>
                                    <p className="text-xs text-red-700 mt-1">
                                        This vendor has been rejected.
                                        {profile?.rejectionReason && (
                                            <span className="block mt-1">
                                                Reason: {profile.rejectionReason}
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <CustomModal
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                }}
                title="Reject Vendor"
            >
                <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                        Please provide a reason for rejecting this vendor. This will be communicated to the vendor.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Rejection Reason
                        </label>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason..."
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectReason("");
                            }}
                            className="px-4 h-9 rounded-lg border-slate-200 text-slate-700 text-sm font-medium"
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            loading={actionLoading === "reject"}
                            onClick={handleReject}
                            disabled={!rejectReason.trim()}
                            className="px-4 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reject Vendor
                        </LoadingButton>
                    </div>
                </div>
            </CustomModal>

            <CustomModal
                isOpen={showResetPasswordModal}
                onClose={() => setShowResetPasswordModal(false)}
                title="Reset Password"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertCircle size={20} className="text-amber-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-amber-800">
                                Confirm Password Reset
                            </h4>
                            <p className="text-xs text-amber-700 mt-1">
                                A password reset link will be sent to <strong>{vendorData?.email}</strong>.
                                The vendor will be able to set a new password.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowResetPasswordModal(false)}
                            className="px-4 h-9 rounded-lg border-slate-200 text-slate-700 text-sm font-medium"
                        >
                            Cancel
                        </Button>

                    </div>
                </div>
            </CustomModal>

            <CustomModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Vendor"
            >
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <AlertCircle size={20} className="text-red-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-semibold text-red-800">
                                Confirm Deletion
                            </h4>
                            <p className="text-xs text-red-700 mt-1">
                                Are you sure you want to delete <strong>{vendorData?.name}</strong>?
                                This action cannot be undone and will permanently remove all vendor data.
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteModal(false)}
                            className="px-4 h-9 rounded-lg border-slate-200 text-slate-700 text-sm font-medium"
                        >
                            Cancel
                        </Button>
                        <LoadingButton
                            loading={actionLoading === "delete"}
                            onClick={handleDelete}
                            className="px-4 h-9 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete Vendor
                        </LoadingButton>
                    </div>
                </div>
            </CustomModal>
        </>
    );
}