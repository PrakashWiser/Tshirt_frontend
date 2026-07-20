import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Ban,
    BedDouble,
    Building2,
    CalendarClock,
    CheckCircle2,
    Clock,
    ImageOff,
    IndianRupee,
    MapPin,
    Percent,
    ShieldCheck,
    Star,
    Tag,
    Timer,
    Users,
    Wallet,
    XCircle,
} from "lucide-react";
import Button from "../../components/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
    clearRoomError,
    getRoomById,
} from "../../store/slice/roomSlice";
import { addToast } from "../../store/slice/uiSlice";
import CustomImage from "../../components/Image";

interface Pricing {
    actualPrice: number;
    offerPrice: number;
    taxPercentage: number;
}

interface HourlyStay {
    isAllowed: boolean;
    minimumHours: number;
    hourlyPrice: number;
}

interface Capacity {
    maxGuests: number;
    adults: number;
    children: number;
}

interface RoomDetails {
    bedrooms: number;
    beds: number;
    bathrooms: number;
    areaSqFt: number;
}

interface AdvancePayment {
    isEnabled: boolean;
    type: "percentage" | "fixed";
    value: number;
}

interface HoldBooking {
    isEnabled: boolean;
    holdMinutes: number;
}

interface BookingSettings {
    advancePayment: AdvancePayment;
    holdBooking: HoldBooking;
    paymentMode: string;
    allowOfflineBooking: boolean;
    allowCancellation: boolean;
}

interface SubLocation {
    _id: string;
    name: string;
    slug: string;
    image: string;
    isPopular: boolean;
}

interface LocationRef {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    country: string;
    image: string;
    mapLink: string;
    subLocations: SubLocation[];
}

interface PropertyPolicies {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    coupleFriendly: boolean;
    cancellationPolicy: string;
}

interface PropertyRef {
    _id: string;
    propertyName: string;
    slug: string;
    category: string;
    vendorId: string | null;
    policies: PropertyPolicies;
    locationId: LocationRef;
    subLocationId: string;
    address: string;
    mapLink: string;
    starRating: number;
    amenities: string[];
    features: string[];
    propertyImages: string[];
    checkInTime: string;
    checkOutTime: string;
}

interface RoomDetailResponse {
    _id: string;
    roomName: string;
    slug: string;
    roomType: string;
    description: string;
    stayType: "hourly" | "daily" | "both";
    amenities: string[];
    features: string[];
    roomImages: string[];
    roomVideos: string[];
    isFeatured: boolean;
    status: number;
    pricing: Pricing;
    hourlyStay: HourlyStay;
    capacity: Capacity;
    roomDetails: RoomDetails;
    bookingSettings: BookingSettings;
    propertyId: PropertyRef;
    createdAt: string;
    updatedAt: string;
}

const formatCurrency = (value: number | undefined): string =>
    `${Number(value ?? 0).toLocaleString("en-IN")}`;

const formatDate = (value?: string): string => {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
};

const toTitleCase = (value: string): string =>
    value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());

function DetailSkeleton() {
    return (
        <div className="animate-pulse space-y-6">
            <div className="h-9 w-40 bg-slate-200 rounded-lg" />
            <div className="h-72 bg-slate-200 rounded-2xl" />
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
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

function InfoCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">{title}</h3>
            {children}
        </div>
    );
}

function InfoRow({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between py-2 text-sm border-b border-slate-100 last:border-b-0">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-900 text-right">{value}</span>
        </div>
    );
}

function BooleanBadge({ value, label }: { value: boolean; label: string }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${value
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-slate-50 text-slate-500 border border-slate-200"
                }`}
        >
            {value ? <CheckCircle2 size={12} /> : <Ban size={12} />}
            {label}
        </span>
    );
}

export default function RoomView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const { room, isLoading, error, message } = useAppSelector(
        (state) => state.rooms,
    );
    const [activeImage, setActiveImage] = useState(0);
    const roomDetail = room as unknown as RoomDetailResponse | null;

    useEffect(() => {
        if (id) {
            dispatch(getRoomById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(clearRoomError());
            navigate("/rooms");
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearRoomError());
        }
    }, [message, error, dispatch, navigate]);

    const images = useMemo(() => {
        if (!roomDetail) return [];

        return (
            roomDetail.roomImages?.length
                ? roomDetail.roomImages
                : roomDetail.propertyId?.propertyImages ?? []
        ).filter(Boolean);
    }, [roomDetail]);

    const hasDiscount =
        !!roomDetail?.pricing?.offerPrice &&
        !!roomDetail?.pricing?.actualPrice &&
        roomDetail.pricing.offerPrice < roomDetail.pricing.actualPrice;

    const displayPrice =
        roomDetail?.pricing?.offerPrice ?? roomDetail?.pricing?.actualPrice ?? 0;

    if (isLoading && !roomDetail) {
        return (
            <div className="p-1">
                <DetailSkeleton />
            </div>
        );
    }

    if (!isLoading && !roomDetail) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ImageOff size={40} className="text-slate-300 mb-3" />
                <h2 className="text-lg font-semibold text-slate-800">
                    Room not found
                </h2>
                <p className="text-sm text-slate-500 mt-1 mb-5">
                    This room may have been deleted or the link is invalid.
                </p>
                <Button
                    onClick={() => navigate("/rooms")}
                    className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Rooms
                </Button>
            </div>
        );
    }

    const property = roomDetail!.propertyId;
    const location = property?.locationId;

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/rooms")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Rooms
                </button>
            </div>

            <div className="mb-6">
                {images.length > 0 ? (
                    <div className="space-y-3">
                        <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                            <CustomImage
                                src={images[activeImage]}
                                alt={roomDetail?.roomName}
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
                                            alt={`${roomDetail?.roomName} thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-56 rounded-2xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                        <ImageOff size={32} />
                        <span className="text-sm mt-2">No images available</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-1 justify-center">
                <h1 className="text-2xl font-bold text-slate-900">
                    {roomDetail?.roomName}
                </h1>
                <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${roomDetail?.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {roomDetail?.status === 1 ? (
                        <CheckCircle2 size={12} />
                    ) : (
                        <XCircle size={12} />
                    )}
                    {roomDetail?.status === 1 ? "Active" : "Inactive"}
                </span>
                {roomDetail?.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        <Star size={12} fill="currentColor" />
                        Featured
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1 mb-6 justify-center">
                <MapPin size={14} />
                {property?.propertyName} · {location?.city}, {location?.state}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <IndianRupee size={22} className="text-slate-800" />
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {formatCurrency(displayPrice)}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Price {hasDiscount && "(offer)"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Users size={22} className="text-blue-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-blue-600">
                                {roomDetail?.capacity?.maxGuests ?? 0}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Max Guests</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Clock size={22} className="text-amber-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-amber-600 capitalize">
                                {roomDetail?.stayType ?? "daily"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Stay Type</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <BedDouble size={22} className="text-green-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-green-600">
                                {roomDetail?.roomDetails?.areaSqFt ?? 0}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Sq. Ft</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    {roomDetail?.description && (
                        <InfoCard title="Description">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {roomDetail.description}
                            </p>
                        </InfoCard>
                    )}

                    <InfoCard title="Room Specifications">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                            <InfoRow
                                label="Room Type"
                                value={
                                    roomDetail?.roomType
                                        ? toTitleCase(roomDetail.roomType)
                                        : "—"
                                }
                            />
                            <InfoRow
                                label="Bedrooms"
                                value={roomDetail?.roomDetails?.bedrooms ?? "—"}
                            />
                            <InfoRow
                                label="Beds"
                                value={roomDetail?.roomDetails?.beds ?? "—"}
                            />
                            <InfoRow
                                label="Bathrooms"
                                value={roomDetail?.roomDetails?.bathrooms ?? "—"}
                            />
                            <InfoRow
                                label="Area"
                                value={
                                    roomDetail?.roomDetails?.areaSqFt
                                        ? `${roomDetail.roomDetails.areaSqFt} sq.ft`
                                        : "—"
                                }
                            />
                            <InfoRow
                                label="Adults / Children"
                                value={`${roomDetail?.capacity?.adults ?? 0} / ${roomDetail?.capacity?.children ?? 0
                                    }`}
                            />
                        </div>
                    </InfoCard>

                    {roomDetail?.hourlyStay?.isAllowed && (
                        <InfoCard title="Hourly Stay">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                <InfoRow
                                    label="Hourly Price"
                                    value={formatCurrency(roomDetail.hourlyStay.hourlyPrice)}
                                />
                                <InfoRow
                                    label="Minimum Hours"
                                    value={
                                        <span className="flex items-center gap-1">
                                            <Timer size={12} />
                                            {roomDetail.hourlyStay.minimumHours} hrs
                                        </span>
                                    }
                                />
                            </div>
                        </InfoCard>
                    )}

                    {(roomDetail?.amenities?.length ?? 0) > 0 && (
                        <InfoCard title="Amenities">
                            <div className="flex flex-wrap gap-2">
                                {roomDetail!.amenities.map((amenity) => (
                                    <span
                                        key={amenity}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700"
                                    >
                                        <Tag size={12} />
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </InfoCard>
                    )}

                    {(roomDetail?.features?.length ?? 0) > 0 && (
                        <InfoCard title="Features">
                            <div className="flex flex-wrap gap-2">
                                {roomDetail!.features.map((feature) => (
                                    <span
                                        key={feature}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-700"
                                    >
                                        <ShieldCheck size={12} />
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </InfoCard>
                    )}

                    <InfoCard title="Booking Settings">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <BooleanBadge
                                value={roomDetail?.bookingSettings?.allowOfflineBooking ?? false}
                                label="Offline Booking"
                            />
                            <BooleanBadge
                                value={roomDetail?.bookingSettings?.allowCancellation ?? false}
                                label="Cancellation"
                            />
                            <BooleanBadge
                                value={roomDetail?.bookingSettings?.holdBooking?.isEnabled ?? false}
                                label="Hold Booking"
                            />
                            <BooleanBadge
                                value={roomDetail?.bookingSettings?.advancePayment?.isEnabled ?? false}
                                label="Advance Payment"
                            />
                        </div>
                        <InfoRow
                            label="Payment Mode"
                            value={
                                roomDetail?.bookingSettings?.paymentMode
                                    ? toTitleCase(roomDetail.bookingSettings.paymentMode)
                                    : "—"
                            }
                        />
                        {roomDetail?.bookingSettings?.holdBooking?.isEnabled && (
                            <InfoRow
                                label="Hold Duration"
                                value={`${roomDetail.bookingSettings.holdBooking.holdMinutes} mins`}
                            />
                        )}
                        {roomDetail?.bookingSettings?.advancePayment?.isEnabled && (
                            <InfoRow
                                label="Advance Amount"
                                value={
                                    roomDetail.bookingSettings.advancePayment.type === "percentage"
                                        ? `${roomDetail.bookingSettings.advancePayment.value}%`
                                        : formatCurrency(roomDetail.bookingSettings.advancePayment.value)
                                }
                            />
                        )}
                    </InfoCard>
                </div>

                <div className="space-y-5">
                    <InfoCard title="Pricing Breakdown">
                        <InfoRow
                            label="Actual Price"
                            value={formatCurrency(roomDetail?.pricing?.actualPrice)}
                        />
                        {hasDiscount && (
                            <InfoRow
                                label="Offer Price"
                                value={
                                    <span className="text-green-600">
                                        {formatCurrency(roomDetail?.pricing?.offerPrice)}
                                    </span>
                                }
                            />
                        )}
                        <InfoRow
                            label="Tax"
                            value={
                                <span className="flex items-center gap-1">
                                    <Percent size={12} />
                                    {roomDetail?.pricing?.taxPercentage ?? 0}%
                                </span>
                            }
                        />
                    </InfoCard>

                    <InfoCard title="Property">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <Building2 size={18} className="text-slate-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">
                                    {property?.propertyName}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {property?.address}
                                </p>
                            </div>
                        </div>
                        <InfoRow
                            label="Category"
                            value={property?.category ? toTitleCase(property.category) : "—"}
                        />
                        <InfoRow
                            label="Star Rating"
                            value={
                                <span className="flex items-center gap-1">
                                    {property?.starRating ?? 0} <Star size={12} fill="currentColor" />
                                </span>
                            }
                        />
                        <InfoRow
                            label="Location"
                            value={`${location?.city ?? "—"}, ${location?.state ?? ""}`}
                        />
                        <InfoRow label="Check-in" value={property?.checkInTime ?? "—"} />
                        <InfoRow label="Check-out" value={property?.checkOutTime ?? "—"} />
                    </InfoCard>

                    <InfoCard title="Property Policies">
                        <div className="flex flex-wrap gap-2">
                            <BooleanBadge
                                value={property?.policies?.smokingAllowed ?? false}
                                label="Smoking"
                            />
                            <BooleanBadge
                                value={property?.policies?.petsAllowed ?? false}
                                label="Pets"
                            />
                            <BooleanBadge
                                value={property?.policies?.coupleFriendly ?? false}
                                label="Couple Friendly"
                            />
                        </div>
                        {property?.policies?.cancellationPolicy && (
                            <p className="text-xs text-slate-500 mt-3 flex items-start gap-1.5">
                                <Wallet size={12} className="mt-0.5 shrink-0" />
                                {property.policies.cancellationPolicy}
                            </p>
                        )}
                    </InfoCard>

                    <InfoCard title="Meta">
                        <InfoRow
                            label="Created"
                            value={
                                <span className="flex items-center gap-1">
                                    <CalendarClock size={12} />
                                    {formatDate(roomDetail?.createdAt)}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Last Updated"
                            value={formatDate(roomDetail?.updatedAt)}
                        />
                        <InfoRow label="Room ID" value={roomDetail?._id ?? "—"} />
                        <InfoRow label="Slug" value={roomDetail?.slug ?? "—"} />
                    </InfoCard>
                </div>
            </div>
        </>
    );
}