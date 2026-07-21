import { useEffect } from "react";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getAllProperties } from "../../store/slice/propertySlice";
import { createRoom, updateRoom } from "../../store/slice/roomSlice";
import type { Room } from "../../types";

interface CreateRoomProps {
    selectedRoom?: Room | null;
    onClose: () => void;
    loading?: boolean;
}

const AMENITY_SUGGESTIONS = [
    "WiFi", "AC", "TV", "Parking", "Mini Bar", "Safe", "Hair Dryer",
    "Bathtub", "Shower", "Iron", "Desk", "Sofa", "Balcony", "Kitchen",
    "Washing Machine", "Room Service", "Swimming Pool", "Gym",
];

const FEATURE_SUGGESTIONS = [
    "Couple Friendly", "Free Cancellation", "Hourly Stay", "Sea View",
    "Mountain View", "City View", "Pet Friendly", "Smoking Allowed",
    "Wheelchair Accessible", "Late Checkout", "Early Checkin",
];

const fields: (properties: { propertyName: string; _id: string }[]) => FormField[] = (properties) => [
    {
        name: "roomName",
        label: "Room Name",
        type: "text",
        placeholder: "Enter room name",
        required: true,
    },
    {
        name: "roomType",
        label: "Room Type",
        type: "select",
        required: true,
        options: [
            { label: "Standard", value: "standard" },
            { label: "Deluxe", value: "deluxe" },
            { label: "Super Deluxe", value: "super_deluxe" },
            { label: "Premium", value: "premium" },
            { label: "Executive", value: "executive" },
            { label: "Suite", value: "suite" },
            { label: "Family Suite", value: "family_suite" },
            { label: "Presidential Suite", value: "presidential_suite" },
        ],
    },
    {
        name: "propertyId",
        label: "Property",
        type: "select",
        required: true,
        options: properties.map((p) => ({ label: p.propertyName, value: p._id })),
    },
    {
        name: "stayType",
        label: "Stay Type",
        type: "select",
        options: [
            { label: "Daily", value: "daily" },
            { label: "Hourly", value: "hourly" },
            { label: "Both", value: "both" },
        ],
    },
    {
        name: "description",
        label: "Description",
        type: "textarea",
        fullWidth: true,
    },

    {
        name: "pricing",
        label: "Pricing",
        type: "json-object",
        fullWidth: true,
        required: true,
        schema: [
            { key: "actualPrice", label: "Actual Price (₹)", type: "number", placeholder: "4500" },
            { key: "offerPrice", label: "Offer Price (₹)", type: "number", placeholder: "3999" },
            { key: "taxPercentage", label: "Tax Percentage (%)", type: "number", placeholder: "18" },
        ],
    },
    {
        name: "hourlyStay",
        label: "Hourly Stay",
        type: "json-object",
        fullWidth: true,
        schema: [
            { key: "isAllowed", label: "Hourly Stay Allowed", type: "boolean" },
            { key: "minimumHours", label: "Minimum Hours", type: "number", placeholder: "3" },
            { key: "hourlyPrice", label: "Price Per Hour (₹)", type: "number", placeholder: "799" },
        ],
    },
    {
        name: "capacity",
        label: "Capacity",
        type: "json-object",
        fullWidth: true,
        schema: [
            { key: "maxGuests", label: "Max Guests", type: "number", placeholder: "4" },
            { key: "adults", label: "Adults", type: "number", placeholder: "3" },
            { key: "children", label: "Children", type: "number", placeholder: "1" },
        ],
    },
    {
        name: "roomDetails",
        label: "Room Details",
        type: "json-object",
        fullWidth: true,
        schema: [
            { key: "bedrooms", label: "Bedrooms", type: "number", placeholder: "1" },
            { key: "beds", label: "Beds", type: "number", placeholder: "1" },
            { key: "bathrooms", label: "Bathrooms", type: "number", placeholder: "1" },
            { key: "areaSqFt", label: "Area (sq. ft)", type: "number", placeholder: "350" },
        ],
    },
    {
        name: "bookingSettings",
        label: "Booking Settings",
        type: "json-object",
        fullWidth: true,
        schema: [
            {
                key: "paymentType",
                label: "Payment Type",
                type: "select",
                options: [
                    { label: "Advance Payment", value: "advance_payment" },
                    { label: "Pay at Hotel", value: "pay_at_hotel" },
                    { label: "Both", value: "both" },
                ],
            },
            {
                key: "allowOfflineBooking",
                label: "Allow Offline Booking",
                type: "boolean",
            },
            {
                key: "instantBook",
                label: "Instant Book",
                type: "boolean",
            },
            {
                key: "minNights",
                label: "Min Nights",
                type: "number",
                placeholder: "1",
            },
            {
                key: "maxNights",
                label: "Max Nights",
                type: "number",
                placeholder: "30",
            },
        ],
    },

    {
        name: "amenities",
        label: "Amenities",
        type: "tags",
        placeholder: "Type amenity and press Enter...",
        suggestions: AMENITY_SUGGESTIONS,
    },
    {
        name: "features",
        label: "Features",
        type: "tags",
        placeholder: "Type feature and press Enter...",
        suggestions: FEATURE_SUGGESTIONS,
    },
    {
        name: "isFeatured",
        label: "Featured Room",
        type: "checkbox",
    },
    {
        name: "roomImages",
        label: "Room Images",
        type: "file",
        fullWidth: true,
        multiple: true,
    },
    {
        name: "roomVideos",
        label: "Room Videos",
        type: "file",
        fullWidth: true,
        multiple: true,
    },
];

export default function CreateRoom({ selectedRoom, onClose, loading }: CreateRoomProps) {
    const dispatch = useAppDispatch();
    const { properties } = useAppSelector((state) => state.property);

    useEffect(() => {
        dispatch(getAllProperties());
    }, [dispatch]);

    const handleSubmit = (values: Record<string, any>) => {
        const formData = new FormData();

        formData.append("propertyId", String(values.propertyId ?? ""));
        formData.append("roomName", String(values.roomName ?? ""));
        formData.append("roomType", String(values.roomType ?? ""));
        formData.append("stayType", String(values.stayType ?? ""));
        formData.append("description", String(values.description ?? ""));
        formData.append("isFeatured", String(values.isFeatured ?? false));

        formData.append("pricing", JSON.stringify(values.pricing || {}));
        formData.append("hourlyStay", JSON.stringify(values.hourlyStay || {}));
        formData.append("capacity", JSON.stringify(values.capacity || {}));
        formData.append("roomDetails", JSON.stringify(values.roomDetails || {}));
        formData.append("bookingSettings", JSON.stringify(values.bookingSettings || {}));

        formData.append("amenities", JSON.stringify(values.amenities || []));
        formData.append("features", JSON.stringify(values.features || []));

        const appendFiles = (key: string, value: unknown) => {
            if (Array.isArray(value)) {
                value.forEach((f) => { if (f instanceof File) formData.append(key, f); });
            } else if (value instanceof File) {
                formData.append(key, value);
            }
        };

        appendFiles("roomImages", values.roomImages);
        appendFiles("roomVideos", values.roomVideos);

        if (selectedRoom?._id) {
            dispatch(updateRoom({ id: selectedRoom._id, data: formData }));
        } else {
            dispatch(createRoom(formData));
        }
    };

    return (
        <div className="p-6">
            <ReusableForm
                title={selectedRoom ? "Edit Room" : "Create Room"}
                fields={fields(properties ?? [])}
                initialValues={{
                    propertyId:
                        typeof selectedRoom?.propertyId === "object"
                            ? selectedRoom.propertyId._id
                            : selectedRoom?.propertyId ?? "",
                    roomName: selectedRoom?.roomName ?? "",
                    roomType: selectedRoom?.roomType ?? "",
                    stayType: selectedRoom?.stayType ?? "",
                    description: selectedRoom?.description ?? "",
                    pricing: selectedRoom?.pricing ?? { actualPrice: "", offerPrice: "", taxPercentage: 18 },
                    hourlyStay: selectedRoom?.hourlyStay ?? { isAllowed: false, minimumHours: "", hourlyPrice: "" },
                    capacity: selectedRoom?.capacity ?? { maxGuests: "", adults: "", children: "" },
                    roomDetails: selectedRoom?.roomDetails ?? { bedrooms: "", beds: "", bathrooms: "", areaSqFt: "" },
                    bookingSettings: selectedRoom?.bookingSettings ?? { paymentMode: "advance_payment", allowOfflineBooking: false, instantBook: false, minNights: 1, maxNights: 30 },
                    amenities: selectedRoom?.amenities ?? [],
                    features: selectedRoom?.features ?? [],
                    isFeatured: selectedRoom?.isFeatured ?? false,
                    roomImages: selectedRoom?.roomImages || [],
                    roomVideos: selectedRoom?.roomVideos || [],
                }}
                submitText={selectedRoom ? "Update Room" : "Create Room"}
                loading={loading}
                onSubmit={handleSubmit}
                onClose={onClose}
            />
        </div>
    );
}