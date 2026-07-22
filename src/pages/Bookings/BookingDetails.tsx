import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    CreditCard,
    IndianRupee,
    MapPin,
    User,
    Users,
    XCircle,
    BedDouble,
    Building2,
    Percent,
    CalendarClock,
    Phone,
    Mail,
    Home,
    Tag,
    Hash,
} from "lucide-react";
import Button from "../../components/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getBookingById } from "../../store/slice/bookingSlice";
import { addToast } from "../../store/slice/uiSlice";
import CustomImage from "../../components/Image";

interface Guest {
    name: string;
    age: number;
    gender: string;
    mobile: string;
    email: string;
    address: string;
    isPrimary: boolean;
}

interface Pricing {
    roomAmount: number;
    discountAmount: number;
    taxableAmount: number;
    taxPercentage: number;
    taxAmount: number;
    totalAmount: number;
    payableNow: number;
    paidAmount: number;
    dueAmount: number;
}

interface RoomPricing {
    actualPrice: number;
    offerPrice: number;
    taxPercentage: number;
}

interface RoomDetail {
    _id: string;
    roomName: string;
    slug: string;
    roomType: string;
    roomImages: string[];
    pricing: RoomPricing;
}

interface PropertyDetail {
    _id: string;
    propertyName: string;
    slug: string;
    category: string;
    address: string;
    mapLink: string;
    checkInTime: string;
    checkOutTime: string;
}

interface LocationDetail {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    country: string;
}

interface BookingResponse {
    _id: string;
    bookingId: string;
    source: string;
    userId: string | null;
    roomId: RoomDetail;
    propertyId: PropertyDetail;
    locationId: LocationDetail;
    vendorId: string | null;
    stayType: string;
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    totalNights: number;
    totalHours: number;
    guests: Guest[];
    customer: {
        name: string;
        mobile: string;
        email: string;
        address: string;
    };
    guestsCount: {
        adults: number;
        children: number;
        total: number;
    };
    unit: {
        unitId: string | null;
        unitNumber: string;
    };
    coupon: {
        couponId: string | null;
        code: string;
        discountAmount: number;
        discountPercentage: number;
    };
    pricing: Pricing;
    cancellation: {
        cancelledAt: string | null;
        cancelledBy: string | null;
        reason: string;
    };
    refund: {
        refundId: string;
        refundAmount: number;
        refundedAt: string | null;
    };
    paymentMode: string;
    paymentType: string;
    paymentStatus: string;
    holdExpiresAt: string | null;
    specialRequests: string;
    status: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

function DetailSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-9 w-40 bg-slate-200 rounded-lg" />
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl" />
                <div className="h-64 bg-slate-200 rounded-2xl" />
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
        <div className="flex items-center justify-between py-2 text-sm border-b border-slate-100 last:border-b-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-900 text-right">{value}</span>
        </div>
    );
}

function formatCurrency(value: number | undefined): string {
    return `${Number(value ?? 0).toLocaleString("en-IN")}`;
}

function formatDate(value?: string): string {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
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
    return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { color: string; label: string }> = {
        pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pending" },
        confirmed: { color: "bg-blue-100 text-blue-700 border-blue-200", label: "Confirmed" },
        checked_in: { color: "bg-green-100 text-green-700 border-green-200", label: "Checked In" },
        checked_out: { color: "bg-gray-100 text-gray-700 border-gray-200", label: "Checked Out" },
        cancelled: { color: "bg-red-100 text-red-700 border-red-200", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = status === "cancelled" ? XCircle : CheckCircle2;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    );
}

function PaymentStatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { color: string; label: string }> = {
        pending: { color: "bg-yellow-100 text-yellow-700 border-yellow-200", label: "Pending" },
        paid: { color: "bg-green-100 text-green-700 border-green-200", label: "Paid" },
        partial: { color: "bg-orange-100 text-orange-700 border-orange-200", label: "Partial" },
        failed: { color: "bg-red-100 text-red-700 border-red-200", label: "Failed" },
        refunded: { color: "bg-purple-100 text-purple-700 border-purple-200", label: "Refunded" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
            <CreditCard size={12} />
            {config.label}
        </span>
    );
}

export default function BookingDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { booking, isLoading, error } = useAppSelector(
        (state) => state.booking,
    );
    const [activeImage, setActiveImage] = useState(0);
    const bookingDetail = booking as unknown as BookingResponse | null;

    useEffect(() => {
        if (id) {
            dispatch(getBookingById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
        }
    }, [error, dispatch]);

    const images = useMemo(() => {
        if (!bookingDetail) return [];
        return bookingDetail.roomId?.roomImages?.length
            ? bookingDetail.roomId.roomImages
            : [];
    }, [bookingDetail]);

    if (isLoading && !bookingDetail) {
        return (
            <div className="p-1">
                <DetailSkeleton />
            </div>
        );
    }

    if (!isLoading && !bookingDetail) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <XCircle size={40} className="text-slate-300 mb-3" />
                <h2 className="text-lg font-semibold text-slate-800">
                    Booking not found
                </h2>
                <p className="text-sm text-slate-500 mt-1 mb-5">
                    This booking may have been deleted or the link is invalid.
                </p>
                <Button
                    onClick={() => navigate("/bookings")}
                    className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Bookings
                </Button>
            </div>
        );
    }

    const property = bookingDetail!.propertyId;
    const room = bookingDetail!.roomId;
    const location = bookingDetail!.locationId;
    const customer = bookingDetail!.customer;
    const guests = bookingDetail!.guests;
    const pricing = bookingDetail!.pricing;
    const primaryGuest = guests.find(g => g.isPrimary) || guests[0];

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/bookings")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Bookings
                </button>
                <div className="flex items-center gap-3">
                    <StatusBadge status={bookingDetail!.status} />
                    <PaymentStatusBadge status={bookingDetail!.paymentStatus} />
                </div>
            </div>

            <div className="mb-6">
                {images.length > 0 ? (
                    <div className="space-y-3">
                        <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                            <CustomImage
                                src={images[activeImage]}
                                alt={room?.roomName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                                {images.map((src, idx) => (
                                    <button
                                        key={src + idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx
                                            ? "border-black"
                                            : "border-transparent"
                                            }`}
                                    >
                                        <CustomImage
                                            src={src}
                                            alt={`${room?.roomName} thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-56 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                        <span className="text-sm">No images available</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-1 justify-center">
                <h1 className="text-2xl font-bold text-slate-900">
                    Booking #{bookingDetail?.bookingId}
                </h1>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                    <Hash size={12} />
                    {bookingDetail?._id?.slice(-8)}
                </span>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1 mb-6 justify-center">
                <Calendar size={14} />
                {formatDate(bookingDetail?.createdAt)} · {toTitleCase(bookingDetail?.stayType || "")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <div className="bg-blue-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <IndianRupee size={22} className="text-blue-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-blue-600">
                                {formatCurrency(pricing?.totalAmount)}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Total Amount</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Users size={22} className="text-green-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-green-600">
                                {bookingDetail?.guestsCount?.total ?? 0}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Total Guests</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Clock size={22} className="text-amber-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-amber-600">
                                {bookingDetail?.guestsCount?.adults ?? 0}A / {bookingDetail?.guestsCount?.children ?? 0}C
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Adults / Children</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <InfoCard title="Room & Property Details">
                        <div className="mb-4 pb-4 border-b border-slate-200">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 mb-1">
                                        {room?.roomName}
                                    </h4>
                                    <p className="text-sm text-slate-500 flex items-center gap-1">
                                        <Building2 size={14} />
                                        {property?.propertyName}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-700">
                                    <Tag size={12} />
                                    {toTitleCase(room?.roomType || "")}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                                <MapPin size={12} />
                                {location?.city}, {location?.state}, {location?.country}
                            </p>
                        </div>
                        <InfoRow
                            label="Booking ID"
                            value={bookingDetail?.bookingId}
                        />
                        <InfoRow
                            label="Source"
                            value={toTitleCase(bookingDetail?.source || "")}
                        />
                        <InfoRow
                            label="Stay Type"
                            value={toTitleCase(bookingDetail?.stayType || "")}
                        />
                        <InfoRow
                            label="Check-in Date"
                            value={formatDate(bookingDetail?.checkInDate)}
                        />
                        <InfoRow
                            label="Check-in Time"
                            value={bookingDetail?.checkInTime || "—"}
                        />
                        <InfoRow
                            label="Check-out Date"
                            value={formatDate(bookingDetail?.checkOutDate)}
                        />
                        <InfoRow
                            label="Check-out Time"
                            value={bookingDetail?.checkOutTime || "—"}
                        />
                        <InfoRow
                            label="Total Nights"
                            value={bookingDetail?.totalNights ?? 0}
                        />
                        {bookingDetail?.specialRequests && (
                            <InfoRow
                                label="Special Requests"
                                value={
                                    <span className="text-sm text-slate-600">
                                        {bookingDetail.specialRequests}
                                    </span>
                                }
                            />
                        )}
                    </InfoCard>

                    <InfoCard title="Guest Information">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <User size={18} className="text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    {customer?.name || primaryGuest?.name || "—"}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                    <Mail size={12} />
                                    {customer?.email || primaryGuest?.email || "—"}
                                    <Phone size={12} />
                                    {customer?.mobile || primaryGuest?.mobile || "—"}
                                </p>
                            </div>
                        </div>
                        <InfoRow
                            label="Total Guests"
                            value={bookingDetail?.guestsCount?.total ?? 0}
                        />
                        <InfoRow
                            label="Adults"
                            value={bookingDetail?.guestsCount?.adults ?? 0}
                        />
                        <InfoRow
                            label="Children"
                            value={bookingDetail?.guestsCount?.children ?? 0}
                        />
                        {primaryGuest && (
                            <>
                                <InfoRow
                                    label="Primary Guest"
                                    value={primaryGuest.name}
                                />
                                <InfoRow
                                    label="Guest Age"
                                    value={primaryGuest.age}
                                />
                                <InfoRow
                                    label="Guest Gender"
                                    value={toTitleCase(primaryGuest.gender)}
                                />
                                <InfoRow
                                    label="Guest Address"
                                    value={
                                        <span className="text-sm text-slate-600 flex items-center gap-1">
                                            <Home size={12} />
                                            {primaryGuest.address || "—"}
                                        </span>
                                    }
                                />
                            </>
                        )}
                    </InfoCard>
                </div>

                <div className="space-y-5">
                    <InfoCard title="Payment Details">
                        <InfoRow
                            label="Payment Mode"
                            value={toTitleCase(bookingDetail?.paymentMode || "")}
                        />
                        <InfoRow
                            label="Payment Type"
                            value={toTitleCase(bookingDetail?.paymentType || "")}
                        />
                        <InfoRow
                            label="Payment Status"
                            value={<PaymentStatusBadge status={bookingDetail!.paymentStatus} />}
                        />
                        <InfoRow
                            label="Room Amount"
                            value={formatCurrency(pricing?.roomAmount)}
                        />
                        {pricing?.discountAmount > 0 && (
                            <InfoRow
                                label="Discount"
                                value={
                                    <span className="text-green-600">
                                        -{formatCurrency(pricing?.discountAmount)}
                                    </span>
                                }
                            />
                        )}
                        <InfoRow
                            label="Taxable Amount"
                            value={formatCurrency(pricing?.taxableAmount)}
                        />
                        <InfoRow
                            label="Tax"
                            value={
                                <span className="flex items-center gap-1">
                                    <Percent size={12} />
                                    {pricing?.taxPercentage}% ({formatCurrency(pricing?.taxAmount)})
                                </span>
                            }
                        />
                        <InfoRow
                            label="Total Amount"
                            value={
                                <span className="font-bold text-slate-900">
                                    {formatCurrency(pricing?.totalAmount)}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Payable Now"
                            value={formatCurrency(pricing?.payableNow)}
                        />
                        <InfoRow
                            label="Paid Amount"
                            value={
                                <span className="text-green-600">
                                    {formatCurrency(pricing?.paidAmount)}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Due Amount"
                            value={
                                <span className="text-amber-600">
                                    {formatCurrency(pricing?.dueAmount)}
                                </span>
                            }
                        />
                        {bookingDetail?.coupon?.code && (
                            <InfoRow
                                label="Coupon Applied"
                                value={
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-xs font-medium text-purple-700">
                                        <Tag size={12} />
                                        {bookingDetail.coupon.code}
                                        {bookingDetail.coupon.discountPercentage > 0 && ` (${bookingDetail.coupon.discountPercentage}%)`}
                                    </span>
                                }
                            />
                        )}
                    </InfoCard>

                    {bookingDetail?.cancellation?.cancelledAt && (
                        <InfoCard title="Cancellation Details">
                            <InfoRow
                                label="Cancelled At"
                                value={formatDateTime(bookingDetail.cancellation.cancelledAt)}
                            />
                            <InfoRow
                                label="Cancelled By"
                                value={bookingDetail.cancellation.cancelledBy || "—"}
                            />
                            <InfoRow
                                label="Reason"
                                value={bookingDetail.cancellation.reason || "—"}
                            />
                            {bookingDetail?.refund?.refundAmount > 0 && (
                                <>
                                    <InfoRow
                                        label="Refund Amount"
                                        value={formatCurrency(bookingDetail.refund.refundAmount)}
                                    />

                                </>
                            )}
                        </InfoCard>
                    )}

                    {bookingDetail?.holdExpiresAt && (
                        <InfoCard title="Hold Information">
                            <InfoRow
                                label="Hold Expires"
                                value={formatDateTime(bookingDetail.holdExpiresAt)}
                            />
                        </InfoCard>
                    )}

                    <InfoCard title="Meta Information">
                        <InfoRow
                            label="Created At"
                            value={
                                <span className="flex items-center gap-1">
                                    <CalendarClock size={12} />
                                    {formatDateTime(bookingDetail?.createdAt)}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Last Updated"
                            value={formatDateTime(bookingDetail?.updatedAt)}
                        />
                        <InfoRow
                            label="Booking Reference"
                            value={bookingDetail?._id?.slice(-8) ?? "—"}
                        />
                        <InfoRow
                            label="Source"
                            value={toTitleCase(bookingDetail?.source || "")}
                        />
                    </InfoCard>

                    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-semibold text-slate-800 mb-4">
                            Quick Actions
                        </h3>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"

                                onClick={() => navigate(`/rooms/view/${room?._id}`)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg  text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                            >
                                <BedDouble size={16} />
                                View Room
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/properties/view/${property?._id}`)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg  text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                            >
                                <Building2 size={16} />
                                View Property
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}