import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Ban,
    Building2,
    CalendarClock,
    CheckCircle2,
    Clock,
    ImageOff,
    MapPin,
    Navigation,
    ShieldCheck,
    Star,
    Tag,
    Wallet,
    XCircle,
} from "lucide-react";
import Button from "../../components/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getPropertyById } from "../../store/slice/propertySlice";
import CustomImage from "../../components/Image";
import MapPicker from "../../components/MapPicker";
import { getPositionFromMapLink } from "../../utils/getPositionFromMapLink";

interface PropertyPolicies {
    smokingAllowed: boolean;
    petsAllowed: boolean;
    coupleFriendly: boolean;
    cancellationPolicy: string;
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
    subLocations: SubLocation[];
}

interface PropertyDetailResponse {
    _id: string;
    propertyName: string;
    slug: string;
    category: string;
    vendorId: string | null;
    policies: PropertyPolicies;
    locationId: LocationRef | string;
    subLocationId: string;
    address: string;
    mapLink: string;
    description: string;
    starRating: number;
    amenities: string[];
    features: string[];
    propertyImages: string[];
    propertyVideos: string[];
    checkInTime: string;
    checkOutTime: string;
    isFeatured: boolean;
    status: number;
    createdAt: string;
    updatedAt: string;
}

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

export default function PropertyView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { property, isLoading } = useAppSelector((state) => state.property);
    const [activeImage, setActiveImage] = useState(0);

    const propertyDetail = property as unknown as PropertyDetailResponse | null;

    useEffect(() => {
        if (id) {
            dispatch(getPropertyById(id));
            setActiveImage(0);
        }
    }, [dispatch, id]);

    const images = useMemo(() => {
        if (!propertyDetail) return [];
        return (propertyDetail.propertyImages ?? []).filter(Boolean);
    }, [propertyDetail]);

    const location =
        propertyDetail && typeof propertyDetail.locationId === "object"
            ? (propertyDetail.locationId as LocationRef)
            : undefined;

    const subLocation = location?.subLocations?.find(
        (sub) => sub._id === propertyDetail?.subLocationId
    );

    if (isLoading && !propertyDetail) {
        return (
            <div className="p-1">
                <DetailSkeleton />
            </div>
        );
    }

    if (!isLoading && !propertyDetail) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ImageOff size={40} className="text-slate-300 mb-3" />
                <h2 className="text-lg font-semibold text-slate-800">Property not found</h2>
                <p className="text-sm text-slate-500 mt-1 mb-5">
                    This property may have been deleted or the link is invalid.
                </p>
                <Button
                    onClick={() => navigate("/properties")}
                    className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Properties
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/properties")}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft size={18} />
                    Back to Properties
                </button>
            </div>

            <div className="mb-6">
                {images.length > 0 ? (
                    <div className="space-y-3">
                        <div className="w-full h-80 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                            <CustomImage
                                src={images[activeImage]}
                                alt={propertyDetail?.propertyName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                                {images.map((src, idx) => (
                                    <button
                                        key={src + idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? "border-black" : "border-transparent"
                                            }`}
                                    >
                                        <CustomImage
                                            src={src}
                                            alt={`${propertyDetail?.propertyName} thumbnail ${idx + 1}`}
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
            <div className="flex flex-wrap items-center justify-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">
                    {propertyDetail?.propertyName}
                </h1>
                <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${propertyDetail?.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {propertyDetail?.status === 1 ? (
                        <CheckCircle2 size={12} />
                    ) : (
                        <XCircle size={12} />
                    )}
                    {propertyDetail?.status === 1 ? "Active" : "Inactive"}
                </span>
                {propertyDetail?.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        <Star size={12} fill="currentColor" />
                        Featured
                    </span>
                )}
            </div>
            <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mb-6">
                <MapPin size={14} />
                {propertyDetail?.address ?? "—"}
                {location && ` · ${location.city}, ${location.state}`}
                {propertyDetail?.mapLink && (
                    <a
                        href={propertyDetail.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline ml-1"
                    >
                        <Navigation size={12} />
                        View on map
                    </a>
                )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Star size={22} className="text-slate-800" />
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {propertyDetail?.starRating ?? 0}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Star Rating</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Building2 size={22} className="text-blue-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-blue-600 capitalize">
                                {propertyDetail?.category ?? "—"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Category</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Clock size={22} className="text-amber-600" />
                        <div>
                            <h3 className="text-xl font-bold text-amber-600">
                                {propertyDetail?.checkInTime ?? "—"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Check-in</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Clock size={22} className="text-green-600" />
                        <div>
                            <h3 className="text-xl font-bold text-green-600">
                                {propertyDetail?.checkOutTime ?? "—"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Check-out</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    {propertyDetail?.description && (
                        <InfoCard title="Description">
                            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                {propertyDetail.description}
                            </p>
                        </InfoCard>
                    )}

                    <InfoCard title="Location">
                        <InfoRow label="City" value={location?.city ?? "—"} />
                        <InfoRow label="State" value={location?.state ?? "—"} />
                        <InfoRow label="Country" value={location?.country ?? "—"} />
                        <InfoRow label="Sub-location" value={subLocation?.name ?? "—"} />
                        <InfoRow label="Address" value={propertyDetail?.address ?? "—"} />
                    </InfoCard>

                    {(propertyDetail?.amenities?.length ?? 0) > 0 && (
                        <InfoCard title="Amenities">
                            <div className="flex flex-wrap gap-2">
                                {propertyDetail!.amenities.map((amenity) => (
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

                    {(propertyDetail?.features?.length ?? 0) > 0 && (
                        <InfoCard title="Features">
                            <div className="flex flex-wrap gap-2">
                                {propertyDetail!.features.map((feature) => (
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
                </div>

                <div className="space-y-5">
                    <InfoCard title="Policies">
                        <div className="flex flex-wrap gap-2">
                            <BooleanBadge
                                value={propertyDetail?.policies?.smokingAllowed ?? false}
                                label="Smoking"
                            />
                            <BooleanBadge
                                value={propertyDetail?.policies?.petsAllowed ?? false}
                                label="Pets"
                            />
                            <BooleanBadge
                                value={propertyDetail?.policies?.coupleFriendly ?? false}
                                label="Couple Friendly"
                            />
                        </div>
                        {propertyDetail?.policies?.cancellationPolicy && (
                            <p className="text-xs text-slate-500 mt-3 flex items-start gap-1.5">
                                <Wallet size={12} className="mt-0.5 shrink-0" />
                                {propertyDetail.policies.cancellationPolicy}
                            </p>
                        )}
                    </InfoCard>

                    <InfoCard title="Meta">
                        <InfoRow
                            label="Created"
                            value={
                                <span className="flex items-center gap-1">
                                    <CalendarClock size={12} />
                                    {formatDate(propertyDetail?.createdAt)}
                                </span>
                            }
                        />
                        <InfoRow
                            label="Last Updated"
                            value={formatDate(propertyDetail?.updatedAt)}
                        />
                        <InfoRow label="Property ID" value={propertyDetail?._id ?? "—"} />
                        <InfoRow label="Slug" value={propertyDetail?.slug ?? "—"} />
                    </InfoCard>

                </div>

            </div>
            <div className="py-5">
                <InfoCard title="Map">
                    <MapPicker
                        initialPosition={getPositionFromMapLink(propertyDetail?.mapLink)}
                        isInput={false}
                        onSelect={() => { }}
                    />
                </InfoCard>
            </div>
        </>
    );
}