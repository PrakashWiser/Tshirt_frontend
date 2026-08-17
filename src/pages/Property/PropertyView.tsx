import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    CalendarClock,
    CheckCircle2,
    ImageOff,
    MapPin,
    ShieldCheck,
    Star,
    XCircle,
    Home,
    Ruler,
    DollarSign,
    Map,
    User,
    Phone,
    Mail,
    Clock,
} from "lucide-react";
import Button from "../../components/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getPropertyById } from "../../store/slice/propertySlice";
import CustomImage from "../../components/Image";
import MapPicker from "../../components/MapPicker";

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

const formatCurrency = (value?: number | string): string => {
    if (!value) return "—";
    if (typeof value === 'string') {
        return value;
    }
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(value);
};

const formatPricePerSqFeet = (value?: string): string => {
    if (!value) return "—";
    return value;
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

export default function PropertyView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { property, isLoading } = useAppSelector((state) => state.property);
    const [activeImage, setActiveImage] = useState(0);

    const propertyDetail = property as any | null;

    useEffect(() => {
        if (id) {
            dispatch(getPropertyById(id));
            setActiveImage(0);
        }
    }, [dispatch, id]);

    const images = useMemo<string[]>(() => {
        if (!propertyDetail) return [];

        if (
            propertyDetail.propertyMedia &&
            propertyDetail.propertyMedia.length > 0
        ) {
            return [...propertyDetail.propertyMedia]
                .sort(
                    (a: any, b: any) =>
                        (a.sortOrder || 0) -
                        (b.sortOrder || 0)
                )
                .map((media: any) => media.url)
                .filter(
                    (url: any): url is string =>
                        typeof url === "string" &&
                        url.length > 0
                );
        }

        if (
            propertyDetail.images &&
            propertyDetail.images.length > 0
        ) {
            return propertyDetail.images.filter(
                (url: any): url is string =>
                    typeof url === "string" &&
                    url.length > 0
            );
        }

        if (
            typeof propertyDetail.image === "string" &&
            propertyDetail.image.length > 0
        ) {
            return [propertyDetail.image];
        }

        return [];
    }, [propertyDetail]);

    const getAddress = () => {
        const addr = propertyDetail?.address;
        if (!addr) return "—";
        const parts = [];
        if (addr.houseNo) parts.push(addr.houseNo);
        if (addr.street) parts.push(addr.street);
        if (addr.locality) parts.push(addr.locality);
        if (addr.city) parts.push(addr.city);
        if (addr.state) parts.push(addr.state);
        if (addr.country) parts.push(addr.country);
        return parts.join(", ") || "—";
    };


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

    const statusDisplay = propertyDetail?.status || "Inactive";
    const isActive = statusDisplay === "Active";

    const getPropertyTypeName = () => {
        if (!propertyDetail?.propertyType) return "—";
        if (typeof propertyDetail.propertyType === 'object') {
            return propertyDetail.propertyType.name || "—";
        }
        return propertyDetail.propertyType;
    };

    const getPropertyActionName = () => {
        if (!propertyDetail?.propertyAction) return "—";
        if (typeof propertyDetail.propertyAction === 'object') {
            return propertyDetail.propertyAction.name || "—";
        }
        return propertyDetail.propertyAction;
    };

    const getOwnerName = () => {
        if (!propertyDetail?.owner) return "—";
        if (typeof propertyDetail.owner === 'object') {
            const firstName = propertyDetail.owner.firstName || "";
            const lastName = propertyDetail.owner.lastName || "";
            return `${firstName} ${lastName}`.trim() || "—";
        }
        return propertyDetail.owner;
    };

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
                                alt={propertyDetail?.name}
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
                                            alt={`${propertyDetail?.name} thumbnail ${idx + 1}`}
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
                    {propertyDetail?.name}
                </h1>
                <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                        }`}
                >
                    {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {statusDisplay}
                </span>
                {propertyDetail?.isFeatured && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        <Star size={12} fill="currentColor" />
                        Featured
                    </span>
                )}
                {propertyDetail?.isHighlighted && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                        <Star size={12} fill="currentColor" />
                        Highlighted
                    </span>
                )}
                {propertyDetail?.isRecommended && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                        <Star size={12} fill="currentColor" />
                        Recommended
                    </span>
                )}
            </div>

            <p className="text-sm text-slate-500 flex items-center justify-center gap-1 mb-6 flex-wrap">
                <MapPin size={14} />
                {getAddress()}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <DollarSign size={22} className="text-slate-800" />
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">
                                {formatCurrency(propertyDetail?.totalPrice)}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Total Price</p>
                        </div>
                    </div>
                </div>
                <div className="bg-blue-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Home size={22} className="text-blue-600" />
                        <div>
                            <h3 className="text-2xl font-bold text-blue-600">
                                {propertyDetail?.bhk || "—"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">BHK</p>
                        </div>
                    </div>
                </div>
                <div className="bg-amber-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <Ruler size={22} className="text-amber-600" />
                        <div>
                            <h3 className="text-xl font-bold text-amber-600">
                                {propertyDetail?.totalSquareFeet
                                    ? `${propertyDetail.totalSquareFeet} sq.ft`
                                    : "—"}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Area</p>
                        </div>
                    </div>
                </div>
                <div className="bg-green-50 rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3">
                        <DollarSign size={22} className="text-green-600" />
                        <div>
                            <h3 className="text-xl font-bold text-green-600">
                                {formatPricePerSqFeet(propertyDetail?.price_per_sqfeet)}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">Price/sq.ft</p>
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

                    <InfoCard title="Address Details">
                        {propertyDetail?.address && typeof propertyDetail.address === 'object' && (
                            <>
                                {propertyDetail.address.houseNo && (
                                    <InfoRow label="House No" value={propertyDetail.address.houseNo} />
                                )}
                                {propertyDetail.address.street && (
                                    <InfoRow label="Street" value={propertyDetail.address.street} />
                                )}
                                {propertyDetail.address.landmark && (
                                    <InfoRow label="Landmark" value={propertyDetail.address.landmark} />
                                )}
                                {propertyDetail.address.locality && (
                                    <InfoRow label="Locality" value={propertyDetail.address.locality} />
                                )}
                                {propertyDetail.address.city && (
                                    <InfoRow label="City" value={propertyDetail.address.city} />
                                )}
                                {propertyDetail.address.state && (
                                    <InfoRow label="State" value={propertyDetail.address.state} />
                                )}
                                {propertyDetail.address.pincode && (
                                    <InfoRow label="Pincode" value={propertyDetail.address.pincode} />
                                )}
                                {propertyDetail.address.country && (
                                    <InfoRow label="Country" value={propertyDetail.address.country} />
                                )}
                            </>
                        )}
                        {propertyDetail?.location?.coordinates && propertyDetail.location.coordinates.length === 2 && (
                            <InfoRow
                                label="Coordinates"
                                value={`${propertyDetail.location.coordinates[0]}, ${propertyDetail.location.coordinates[1]}`}
                            />
                        )}
                    </InfoCard>

                    {propertyDetail?.lifestyles && propertyDetail.lifestyles.length > 0 && (
                        <InfoCard title="Lifestyles">
                            <div className="flex flex-wrap gap-2">
                                {propertyDetail.lifestyles.map((lifestyle: any, index: number) => {
                                    const name = typeof lifestyle === "string"
                                        ? lifestyle
                                        : lifestyle?.name || "Unknown";
                                    const key = typeof lifestyle === "string"
                                        ? lifestyle
                                        : lifestyle?._id || `${name}-${index}`;
                                    return (
                                        <span
                                            key={key}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-700"
                                        >
                                            <ShieldCheck size={12} />
                                            {name}
                                        </span>
                                    );
                                })}
                            </div>
                        </InfoCard>
                    )}

                    {propertyDetail?.premiumAmenities && propertyDetail.premiumAmenities.length > 0 && (
                        <InfoCard title="Premium Amenities">
                            <div className="flex flex-wrap gap-2">
                                {propertyDetail.premiumAmenities.map((amenity: any, index: number) => {
                                    const name = typeof amenity === "string"
                                        ? amenity
                                        : amenity?.name || "Unknown";
                                    const key = typeof amenity === "string"
                                        ? `${amenity}-${index}`
                                        : amenity?._id || `${name}-${index}`;
                                    return (
                                        <span
                                            key={key}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-medium text-amber-700"
                                        >
                                            <Star size={12} fill="currentColor" />
                                            {name}
                                        </span>
                                    );
                                })}
                            </div>
                        </InfoCard>
                    )}

                    {propertyDetail?.neighborhoods && propertyDetail.neighborhoods.length > 0 && (
                        <InfoCard title="Nearby Places">
                            <div className="space-y-2">
                                {propertyDetail.neighborhoods.map((neighborhood: any, index: number) => {
                                    const name = typeof neighborhood === "string"
                                        ? neighborhood
                                        : neighborhood?.name || "Unknown";
                                    const type = typeof neighborhood === "string"
                                        ? ""
                                        : neighborhood?.type || "";
                                    const time = typeof neighborhood === "string"
                                        ? ""
                                        : neighborhood?.time || "";
                                    const timeUnit = typeof neighborhood === "string"
                                        ? ""
                                        : neighborhood?.timeUnit || "";
                                    const key = typeof neighborhood === "string"
                                        ? `${neighborhood}-${index}`
                                        : neighborhood?._id || `${name}-${index}`;

                                    return (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between py-2 text-sm border-b border-slate-100 last:border-b-0"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Map size={14} className="text-slate-400" />
                                                <span className="font-medium text-slate-800">{name}</span>
                                                {type && (
                                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                                        {type}
                                                    </span>
                                                )}
                                            </div>
                                            {time && (
                                                <span className="text-xs text-slate-600 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {time} {timeUnit}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </InfoCard>
                    )}
                </div>

                <div className="space-y-5">
                    <InfoCard title="Property Details">
                        <InfoRow label="Property Type" value={getPropertyTypeName()} />
                        <InfoRow label="Property Action" value={getPropertyActionName()} />
                        <InfoRow label="BHK" value={propertyDetail?.bhk || "—"} />
                        {propertyDetail?.furnished && (
                            <InfoRow label="Furnished" value={propertyDetail.furnished} />
                        )}
                        <InfoRow
                            label="Total Area"
                            value={propertyDetail?.totalSquareFeet
                                ? `${propertyDetail.totalSquareFeet} sq.ft`
                                : "—"}
                        />
                        {propertyDetail?.totalBuiltArea && (
                            <InfoRow
                                label="Built Area"
                                value={`${propertyDetail.totalBuiltArea} sq.ft`}
                            />
                        )}
                        <InfoRow label="Total Price" value={formatCurrency(propertyDetail?.totalPrice)} />
                        <InfoRow label="Price/sq.ft" value={formatPricePerSqFeet(propertyDetail?.price_per_sqfeet)} />
                        {propertyDetail?.visitCount !== undefined && (
                            <InfoRow label="Visit Count" value={propertyDetail.visitCount} />
                        )}
                        {propertyDetail?.isVerified !== undefined && (
                            <InfoRow
                                label="Verified"
                                value={propertyDetail.isVerified ? "Yes" : "No"}
                            />
                        )}
                    </InfoCard>

                    {propertyDetail?.owner && (
                        <InfoCard title="Owner Information">
                            <div className="space-y-2">
                                {propertyDetail.owner.firstName && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <User size={14} className="text-slate-400" />
                                        <span className="font-medium text-slate-800">{getOwnerName()}</span>
                                    </div>
                                )}
                                {propertyDetail.owner.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail size={14} className="text-slate-400" />
                                        <span className="text-slate-600">{propertyDetail.owner.email}</span>
                                    </div>
                                )}
                                {propertyDetail.owner.mobile && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone size={14} className="text-slate-400" />
                                        <span className="text-slate-600">{propertyDetail.owner.mobile}</span>
                                    </div>
                                )}
                            </div>
                        </InfoCard>
                    )}

                    <InfoCard title="Meta Information">
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
                        <InfoRow label="Property ID" value={propertyDetail?._id || "—"} />
                        <InfoRow label="Status" value={statusDisplay} />
                        {propertyDetail?.isFeatured && (
                            <InfoRow label="Featured" value="Yes" />
                        )}
                        {propertyDetail?.isHighlighted && (
                            <InfoRow label="Highlighted" value="Yes" />
                        )}
                        {propertyDetail?.isRecommended && (
                            <InfoRow label="Recommended" value="Yes" />
                        )}
                    </InfoCard>
                </div>
            </div>

            {propertyDetail?.location?.coordinates && propertyDetail.location.coordinates.length === 2 && (
                <div className="py-5">
                    <InfoCard title="Location Map">
                        <MapPicker
                            initialPosition={{
                                lat: propertyDetail.location.coordinates[1],
                                lng: propertyDetail.location.coordinates[0]
                            }}
                            isInput={false}
                            onSelect={() => { }}
                        />
                    </InfoCard>
                </div>
            )}
        </>
    );
}