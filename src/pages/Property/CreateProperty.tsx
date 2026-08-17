import { useEffect, useMemo, useState } from "react";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
    createProperty,
    updateProperty,
    getPropertyFilters,
    type Property,
    getPropertyById,
} from "../../store/slice/propertySlice";
import { clearPropertyActionError, getAllPropertyActions } from "../../store/slice/propertyActionSlice";
import { clearPropertyTypeError, getAllPropertyTypes } from "../../store/slice/propertyTypeSlice";
import { clearBHKError, getAllBHKs } from "../../store/slice/bhkSlice";
import { clearAmenityError, getAllAmenities } from "../../store/slice/premiumAmenitySlice";
import { clearLifestyleError, getAllLifestyles } from "../../store/slice/lifestyleSlice";
import PropertyTypeCreate from "../PropertyTypeSection/CreatePropertyType";
import CreateBHK from "../BHK/CreateBhk";
import PropertyActionCreate from "../PropertyAction/CreatePropertyAction";
import CreateAmenity from "../AmenitySection/CreateAmenitySection";
import CreateLifestyle from "../Lifestyle/CreateLifestyle";
import { addToast } from "../../store/slice/uiSlice";

interface CreatePropertyProps {
    selectedProperty?: Property | null;
    onClose: () => void;
    loading?: boolean;
}

export default function CreateProperty({ selectedProperty, onClose, loading }: CreatePropertyProps) {
    const dispatch = useAppDispatch();
    const { property } = useAppSelector((state) => state.property);
    const {
        propertyActions,
        message: propertyActionsMessage,
        error: propertyActionsError,
    } = useAppSelector((state) => state.propertyAction);
    const {
        propertyTypes,
        message: propertyTypesMessage,
        error: propertyTypesError,
    } = useAppSelector((state) => state.propertyType);
    const {
        bhks,
        message: bhksMessage,
        error: bhksError,
    } = useAppSelector((state) => state.bhk);
    const {
        amenities,
        message: AmenitiesMessage,
        error: AmenitiesError,
    } = useAppSelector((state) => state.premiumAmenities);
    const {
        lifestyles,
        message: lifeStyleMessage,
        error: lifeStyleError,
    } = useAppSelector((state) => state.lifestyle);
    const [showCreatePropertyAction, setShowCreatePropertyAction] = useState(false);
    const [showCreatePropertyType, setShowCreatePropertyType] = useState(false);
    const [showCreateBHK, setShowCreateBHK] = useState(false);
    const [showCreateAmenity, setShowCreateAmenity] = useState(false);
    const [showCreateLifestyle, setShowCreateLifestyle] = useState(false);

    const formProperty = selectedProperty ? property : null;

    useEffect(() => {
        if (selectedProperty?.id) dispatch(getPropertyById(selectedProperty.id));
    }, [dispatch, selectedProperty]);

    const refreshPropertyOptions = () => {
        dispatch(getPropertyFilters());
        dispatch(getAllPropertyActions());
        dispatch(getAllPropertyTypes());
        dispatch(getAllBHKs());
        dispatch(getAllAmenities());
        dispatch(getAllLifestyles());
        dispatch(clearLifestyleError());
        dispatch(clearBHKError());
        dispatch(clearPropertyActionError());
        dispatch(clearPropertyTypeError());
        dispatch(clearAmenityError());
    };

    useEffect(() => {
        if (propertyActionsMessage) {
            dispatch(addToast({ type: "success", text: propertyActionsMessage }));
            setShowCreatePropertyAction(false);
            refreshPropertyOptions();
        }
        if (propertyActionsError) {
            dispatch(addToast({ type: "error", text: propertyActionsError }));
        }
        if (propertyTypesMessage) {
            dispatch(addToast({ type: "success", text: propertyTypesMessage }));
            setShowCreatePropertyType(false);
            refreshPropertyOptions();
        }
        if (propertyTypesError) {
            dispatch(addToast({ type: "error", text: propertyTypesError }));
        }
        if (bhksMessage) {
            dispatch(addToast({ type: "success", text: bhksMessage }));
            setShowCreateBHK(false);
            refreshPropertyOptions();
        }
        if (bhksError) {
            dispatch(addToast({ type: "error", text: bhksError }));
        }
        if (AmenitiesMessage) {
            dispatch(addToast({ type: "success", text: AmenitiesMessage }));
            setShowCreateAmenity(false);
            refreshPropertyOptions();
        }
        if (AmenitiesError) {
            dispatch(addToast({ type: "error", text: AmenitiesError }));
        }
        if (lifeStyleMessage) {
            dispatch(addToast({ type: "success", text: lifeStyleMessage }));
            setShowCreateLifestyle(false);
            refreshPropertyOptions();
        }
        if (lifeStyleError) {
            dispatch(addToast({ type: "error", text: lifeStyleError }));
        }
    }, [
        dispatch,
        propertyActionsMessage,
        propertyActionsError,
        propertyTypesMessage,
        propertyTypesError,
        bhksMessage,
        bhksError,
        AmenitiesMessage,
        AmenitiesError,
        lifeStyleMessage,
        lifeStyleError,
    ]);

    useEffect(() => {
        dispatch(getPropertyFilters());
        dispatch(getAllPropertyActions());
        dispatch(getAllPropertyTypes());
        dispatch(getAllBHKs());
        dispatch(getAllAmenities());
        dispatch(getAllLifestyles());
    }, [dispatch]);

    const bhkOptions = useMemo(
        () =>
            bhks
                .filter((bhk) => bhk.status === "Active")
                .map((bhk) => ({ label: bhk.name, value: bhk._id })),
        [bhks]
    );

    const amenityOptions = useMemo(
        () =>
            amenities
                .filter((amenity) => Number(amenity.status) === 1)
                .map((amenity) => ({ label: amenity.name, value: amenity._id })),
        [amenities]
    );

    const lifestyleOptions = useMemo(
        () =>
            lifestyles
                .filter((lifestyle) => lifestyle.status === "Active")
                .map((lifestyle) => ({ label: lifestyle.name, value: lifestyle._id })),
        [lifestyles]
    );

    const propertyActionOptions = useMemo(() => {
        const options = propertyActions.map((pa) => ({
            label: pa.name,
            value: pa._id
        }));
        return [
            ...options,
            {
                label: "+ Add New Property Action",
                value: "add_new_property_action",
                isCreateOption: true
            }
        ];
    }, [propertyActions]);

    const propertyTypeOptions = useMemo(() => {
        const options = propertyTypes.map((pt) => ({
            label: pt.name,
            value: pt._id
        }));
        return [
            ...options,
            {
                label: "+ Add New Property Type",
                value: "add_new_property_type",
                isCreateOption: true
            }
        ];
    }, [propertyTypes]);

    const bhkOptionsWithCreate = useMemo(() => {
        const options = bhkOptions;
        return [
            ...options,
            {
                label: "+ Add New BHK",
                value: "add_new_bhk",
                isCreateOption: true
            }
        ];
    }, [bhkOptions]);

    const amenityOptionsWithCreate = useMemo(() => {
        const options = amenityOptions;
        return [
            ...options,
            {
                label: "+ Add New Amenity",
                value: "add_new_amenity",
                isCreateOption: true
            }
        ];
    }, [amenityOptions]);

    const lifestyleOptionsWithCreate = useMemo(() => {
        const options = lifestyleOptions;
        return [
            ...options,
            {
                label: "+ Add New Lifestyle",
                value: "add_new_lifestyle",
                isCreateOption: true
            }
        ];
    }, [lifestyleOptions]);

    const handleFieldChange = (name: string, value: any) => {
        if (name === "propertyAction" && value === "add_new_property_action") {
            setShowCreatePropertyAction(true);
            return;
        }
        if (name === "propertyType" && value === "add_new_property_type") {
            setShowCreatePropertyType(true);
            return;
        }
        if (name === "bhk" && value === "add_new_bhk") {
            setShowCreateBHK(true);
            return;
        }
        if (name === "amenities") {
            const lastValue = Array.isArray(value) ? value[value.length - 1] : value;
            if (lastValue === "add_new_amenity") {
                setShowCreateAmenity(true);
                return;
            }
        }
        if (name === "lifestyles") {
            const lastValue = Array.isArray(value) ? value[value.length - 1] : value;
            if (lastValue === "add_new_lifestyle") {
                setShowCreateLifestyle(true);
                return;
            }
        }
    };

    const fields: FormField[] = [
        {
            name: "name",
            label: "Property Name",
            type: "text",
            placeholder: "Enter property name",
            required: true
        },
        {
            name: "propertyAction",
            label: "Property Action",
            type: "select",
            required: true,
            options: propertyActionOptions,
            onOptionSelect: (option: any) => {
                if (option.isCreateOption) {
                    setShowCreatePropertyAction(true);
                }
            }
        },
        {
            name: "propertyType",
            label: "Property Type",
            type: "select",
            required: true,
            options: propertyTypeOptions,
            onOptionSelect: (option: any) => {
                if (option.isCreateOption) {
                    setShowCreatePropertyType(true);
                }
            }
        },
        {
            name: "amenities",
            label: "Amenities",
            type: "multi-select",
            required: false,
            options: amenityOptionsWithCreate,
            onOptionSelect: (option: any) => {
                if (option.isCreateOption) {
                    setShowCreateAmenity(true);
                }
            }
        },
        {
            name: "lifestyles",
            label: "Lifestyle",
            type: "multi-select",
            required: false,
            options: lifestyleOptionsWithCreate,
            onOptionSelect: (option: any) => {
                if (option.isCreateOption) {
                    setShowCreateLifestyle(true);
                }
            }
        },
        {
            name: "bhk",
            label: "BHK",
            type: "select",
            required: true,
            options: bhkOptionsWithCreate,
            onOptionSelect: (option: any) => {
                if (option.isCreateOption) {
                    setShowCreateBHK(true);
                }
            }
        },
        {
            name: "totalSquareFeet",
            label: "Total Square Feet",
            type: "number",
            placeholder: "e.g. 1800",
            required: true
        },
        {
            name: "totalBuiltArea",
            label: "Total Built Area",
            type: "number",
            placeholder: "e.g. 1650",
            required: false
        },
        {
            name: "totalPrice",
            label: "Total Price (₹)",
            type: "number",
            placeholder: "e.g. 12500000",
            required: true
        },
        {
            name: "isHighlighted",
            label: "Is Highlighted",
            type: "checkbox"
        },
        {
            name: "isRecommended",
            label: "Is Recommended",
            type: "checkbox"
        },
        {
            name: "isFeatured",
            label: "Is Featured",
            type: "checkbox"
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Describe the property...",
            required: false,
            fullWidth: true
        },
        {
            name: "mapLink",
            label: "Location Map",
            type: "map",
            fullWidth: true,
        },
        {
            name: "address",
            label: "Address Details",
            type: "json-object",
            fullWidth: true,
            required: true,
            schema: [
                {
                    key: "houseNo",
                    label: "House No",
                    type: "text",
                    placeholder: "e.g. 12A"
                },
                {
                    key: "street",
                    label: "Street",
                    type: "text",
                    placeholder: "e.g. Anna Nagar Main Road"
                },
                {
                    key: "landmark",
                    label: "Landmark",
                    type: "text",
                    placeholder: "e.g. Near Metro Station"
                },
            ],
        },
        {
            name: "location",
            label: "Location",
            type: "json-object",
            fullWidth: true,
            required: true,
            schema: [
                {
                    key: "locality",
                    label: "Locality",
                    type: "text",
                    placeholder: "e.g. Anna Nagar"
                },
                {
                    key: "city",
                    label: "City",
                    type: "text",
                    placeholder: "e.g. Chennai"
                },
                {
                    key: "state",
                    label: "State",
                    type: "text",
                    placeholder: "e.g. Tamil Nadu"
                },
                {
                    key: "pincode",
                    label: "Pincode",
                    type: "text",
                    placeholder: "e.g. 600040"
                },
                {
                    key: "country",
                    label: "Country",
                    type: "text",
                    placeholder: "e.g. India"
                },
            ],
        },
        {
            name: "images",
            label: "Property Images",
            type: "file",
            fullWidth: true,
            multiple: true
        },
    ];

    const handleSubmit = (values: Record<string, any>) => {
        const formData = new FormData();
        formData.append("name", values.name || "");
        formData.append("propertyType", values.propertyType || "");
        formData.append("propertyAction", values.propertyAction || "");
        formData.append("bhk", String(values.bhk || ""));
        formData.append("totalSquareFeet", String(values.totalSquareFeet || ""));
        if (values.totalBuiltArea !== undefined && values.totalBuiltArea !== null && values.totalBuiltArea !== "") {
            formData.append("totalBuiltArea", String(values.totalBuiltArea));
        }
        formData.append("totalPrice", String(values.totalPrice || ""));
        if (values.description) formData.append("description", values.description);
        if (Array.isArray(values.amenities)) {
            const filteredAmenities = values.amenities.filter((id: string) => id !== "add_new_amenity");
            filteredAmenities.forEach((id: string) => formData.append("premiumAmenities[]", id));
        }
        if (Array.isArray(values.lifestyles)) {
            const filteredLifestyles = values.lifestyles.filter((id: string) => id !== "add_new_lifestyle");
            filteredLifestyles.forEach((id: string) => formData.append("lifestyles[]", id));
        }
        formData.append("isHighlighted", String(values.isHighlighted ?? false));
        formData.append("isRecommended", String(values.isRecommended ?? false));
        formData.append("isFeatured", String(values.isFeatured ?? false));
        formData.append(
            "location",
            JSON.stringify({
                type: "Point",
                coordinates: [
                    Number(values.coordinates?.longitude || 0),
                    Number(values.coordinates?.latitude || 0)
                ]
            })
        );
        formData.append(
            "address",
            JSON.stringify({
                houseNo: values.address?.houseNo || "",
                street: values.address?.street || "",
                landmark: values.address?.landmark || "",
                locality: values.location?.locality || "",
                city: values.location?.city || "",
                state: values.location?.state || "",
                pincode: values.location?.pincode || "",
                country: values.location?.country || ""
            })
        );
        if (Array.isArray(values.images)) {
            values.images.forEach((file: File | string) => {
                if (file instanceof File) {
                    formData.append("propertyMedia", file);
                }
            });
        } else if (values.images instanceof File) {
            formData.append("propertyMedia", values.images);
        }
        if (selectedProperty?.id) {
            dispatch(updateProperty({ id: selectedProperty.id, data: formData }));
        } else {
            dispatch(createProperty(formData));
        }
    };

    const initialValues = {
        name: formProperty?.name || "",
        propertyType:
            typeof formProperty?.propertyType === "object" && formProperty?.propertyType !== null
                ? formProperty.propertyType._id
                : "",
        propertyAction:
            typeof formProperty?.propertyAction === "object" && formProperty?.propertyAction !== null
                ? formProperty.propertyAction._id
                : "",
        bhk: bhks.find(
            (bhk) =>
                String(bhk.name).trim().toLowerCase() ===
                String(formProperty?.bhk || "").trim().toLowerCase()
        )?._id || "",
        totalSquareFeet: formProperty?.totalSquareFeet || "",
        totalBuiltArea: formProperty?.totalBuiltArea || "",
        totalPrice: (() => {
            const price = String(formProperty?.totalPrice || "");
            if (price.toLowerCase().includes("lakhs")) {
                const value = parseFloat(
                    price.replace("₹", "").replace(/lakhs/i, "").trim()
                );
                return value * 100000;
            }
            if (price.toLowerCase().includes("crores")) {
                const value = parseFloat(
                    price.replace("₹", "").replace(/crores/i, "").trim()
                );
                return value * 10000000;
            }
            return parseFloat(price.replace(/[₹,]/g, "")) || "";
        })(),
        isHighlighted: formProperty?.isHighlighted ?? false,
        isRecommended: formProperty?.isRecommended ?? false,
        isFeatured: formProperty?.isFeatured ?? false,
        description: formProperty?.description || "",
        amenities: Array.isArray(formProperty?.premiumAmenities)
            ? formProperty.premiumAmenities.map((item: any) =>
                typeof item === "object" && item !== null ? item._id : item
            )
            : [],
        lifestyles: Array.isArray(formProperty?.lifestyles)
            ? formProperty.lifestyles.map((item: any) =>
                typeof item === "object" && item !== null ? item._id : item
            )
            : [],
        address: {
            houseNo: formProperty?.address?.houseNo || "",
            street: formProperty?.address?.street || "",
            landmark: formProperty?.address?.landmark || "",
        },
        location: {
            locality: formProperty?.address?.locality || "",
            city: formProperty?.address?.city || "",
            state: formProperty?.address?.state || "",
            pincode: formProperty?.address?.pincode || "",
            country: formProperty?.address?.country || "",
        },
        coordinates: {
            latitude: formProperty?.location?.coordinates?.[1] || 0,
            longitude: formProperty?.location?.coordinates?.[0] || 0,
        },
        images: Array.isArray(formProperty?.propertyMedia)
            ? formProperty.propertyMedia.map((media) => media.url)
            : [],
    };

    const handleCreateModalClose = () => {
        setShowCreatePropertyAction(false);
        setShowCreatePropertyType(false);
        setShowCreateBHK(false);
        setShowCreateAmenity(false);
        setShowCreateLifestyle(false);
        refreshPropertyOptions();
    };

    return (
        <div className="p-6">
            <ReusableForm
                title={formProperty ? "Edit Property" : "Create Property"}
                fields={fields}
                initialValues={initialValues}
                submitText={formProperty ? "Update Property" : "Create Property"}
                loading={loading}
                onSubmit={handleSubmit}
                onClose={onClose}
                onFieldChange={handleFieldChange}
            />
            {showCreatePropertyAction && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <PropertyActionCreate onClose={handleCreateModalClose} />
                    </div>
                </div>
            )}
            {showCreatePropertyType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <PropertyTypeCreate onClose={handleCreateModalClose} />
                    </div>
                </div>
            )}
            {showCreateBHK && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CreateBHK onClose={handleCreateModalClose} />
                    </div>
                </div>
            )}
            {showCreateAmenity && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CreateAmenity onClose={handleCreateModalClose} />
                    </div>
                </div>
            )}
            {showCreateLifestyle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <CreateLifestyle onClose={handleCreateModalClose} />
                    </div>
                </div>
            )}
        </div>
    );
}