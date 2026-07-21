import { useEffect, useMemo, useState } from "react";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getAllLocations } from "../../store/slice/locationSlice";
import { createProperty, updateProperty } from "../../store/slice/propertySlice";

const AMENITY_SUGGESTIONS = [
    "Swimming Pool", "Restaurant", "WiFi", "Gym", "Spa", "Parking",
    "Air Conditioning", "Room Service", "Laundry", "Bar", "Garden",
    "Beach Access", "Conference Room", "Kids Club", "Airport Shuttle",
];

const FEATURE_SUGGESTIONS = [
    "Couple Friendly", "Free Parking", "24x7 Reception", "Sea View",
    "Balcony", "Pet Friendly", "Wheelchair Accessible", "EV Charging",
    "Private Pool", "Mountain View",
];

const DEFAULT_POLICIES = {
    smokingAllowed: false,
    petsAllowed: false,
    coupleFriendly: true,
    cancellationPolicy: "Free cancellation before 24 hours",
};

interface CreatePropertyProps {
    selectedProperty?: any | null;
    onClose: () => void;
    loading?: boolean;
}



export default function CreateProperty({ selectedProperty, onClose, loading }: CreatePropertyProps) {
    const dispatch = useAppDispatch();
    const { locations } = useAppSelector((state) => state.locations);
    const [selectedLocationId, setSelectedLocationId] = useState(
        selectedProperty?.locationId?._id || ""

    );

    useEffect(() => {
        dispatch(getAllLocations());
    }, [dispatch]);

    const subLocationOptions = useMemo(() => {
        const location = locations.find(
            (loc) => loc._id === selectedLocationId
        );

        return (
            (location as any)?.subLocations?.map((sub: any) => ({
                label: sub.name,
                value: sub._id,
            })) || []
        );
    }, [locations, selectedLocationId]);


    useEffect(() => {
        if (selectedProperty?.locationId?._id && locations.length > 0) {
            setSelectedLocationId(selectedProperty.locationId._id);
        }
    }, [selectedProperty, locations]);


    const fields: FormField[] = [
        {
            name: "propertyName",
            label: "Property Name",
            type: "text",
            placeholder: "Enter property name",
            required: true,
        },
        {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            options: [
                { label: "Hotel", value: "hotel" },
                { label: "Resort", value: "resort" },
                { label: "Villa", value: "villa" },
                { label: "Apartment", value: "apartment" },
                { label: "Homestay", value: "homestay" },
                { label: "Guesthouse", value: "guesthouse" },
            ],
        },
        {
            name: "locationId",
            label: "Location",
            type: "select",
            required: true,
            options:
                locations?.map((location) => ({
                    label: location.name,
                    value: location._id,
                })) || [],
        },
        {
            name: "subLocationId",
            label: "Sub Location",
            type: "select",
            options:
                subLocationOptions
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            fullWidth: true,
        },
        {
            name: "mapLink",
            label: "Map Location",
            type: "map",
            fullWidth: true,
        },
        {
            name: "starRating",
            label: "Star Rating",
            type: "text",
            placeholder: "1 - 5",
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
            label: "Featured Property",
            type: "checkbox",
        },
        {
            name: "policies",
            label: "Policies",
            type: "policies",
            fullWidth: true,
        },
        {
            name: "checkInTime",
            label: "Check In Time",
            type: "text",
            placeholder: "12:00 PM",
        },
        {
            name: "checkOutTime",
            label: "Check Out Time",
            type: "text",
            placeholder: "11:00 AM",
        },

        {
            name: "propertyImages",
            label: "Property Images",
            type: "file",
            fullWidth: true,
            multiple: true,
        },
        {
            name: "propertyVideos",
            label: "Property Videos",
            type: "file",
            fullWidth: true,
        },
    ];

    const handleSubmit = (values: Record<string, any>) => {
        const formData = new FormData();
        formData.append("propertyName", values.propertyName);
        formData.append("category", values.category);
        formData.append("locationId", values.locationId);
        formData.append("subLocationId", values.subLocationId || "");
        formData.append("description", values.description || "");
        formData.append("mapLink", values.mapLink || {})
        formData.append("starRating", String(values.starRating || 0));
        formData.append("amenities", JSON.stringify(values.amenities || []));
        formData.append("features", JSON.stringify(values.features || []));
        formData.append("policies", JSON.stringify(values.policies || DEFAULT_POLICIES));
        formData.append("checkInTime", values.checkInTime || "");
        formData.append("checkOutTime", values.checkOutTime || "");
        formData.append("isFeatured", String(values.isFeatured ?? false));

        if (Array.isArray(values.propertyImages)) {
            values.propertyImages.forEach((file: File) => formData.append("propertyImages", file));
        } else if (values.propertyImages instanceof File) {
            formData.append("propertyImages", values.propertyImages);
        }

        if (values.propertyVideos instanceof File) {
            formData.append("propertyVideos", values.propertyVideos);
        }

        if (selectedProperty?._id) {
            dispatch(updateProperty({ id: selectedProperty._id, data: formData }));
        } else {
            dispatch(createProperty(formData));
        }
    };

    return (
        <div className="p-6">
            <ReusableForm
                title={selectedProperty ? "Edit Property" : "Create Property"}
                fields={fields}
                initialValues={{
                    propertyName: selectedProperty?.propertyName || "",
                    category: selectedProperty?.category || "",
                    locationId: selectedProperty?.locationId?._id || "",
                    subLocationId: selectedProperty?.subLocationId || "",
                    description: selectedProperty?.description || "",
                    mapLink: selectedProperty?.mapLink || "",
                    starRating: selectedProperty?.starRating || "",
                    amenities: selectedProperty?.amenities || [],
                    features: selectedProperty?.features || [],
                    policies: selectedProperty?.policies ?? DEFAULT_POLICIES,
                    checkInTime: selectedProperty?.checkInTime || "",
                    checkOutTime: selectedProperty?.checkOutTime || "",
                    isFeatured: selectedProperty?.isFeatured || false,
                    propertyImages: selectedProperty?.propertyImages || [],
                    propertyVideos: "",
                }}
                submitText={selectedProperty ? "Update Property" : "Create Property"}
                loading={loading}
                onSubmit={handleSubmit}
                onClose={onClose}
                onFieldChange={(name, value) => {
                    if (name === "locationId") {
                        setSelectedLocationId(value);
                    }
                }}
            />
        </div>
    );
}