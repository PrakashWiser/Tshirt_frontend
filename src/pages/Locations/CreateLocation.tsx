import ReusableForm, { type FormField } from "../../components/ReusableForm";
import { useAppDispatch } from "../../hooks/hooks";
import { createLocation, updateLocation } from "../../store/slice/locationSlice";


interface CreateLocationProps {
    selectedLocation?: any;
    onClose: () => void;

}

export default function CreateLocation({ selectedLocation,
    onClose }: CreateLocationProps) {
    const dispatch = useAppDispatch()

    const fields: FormField[] = [
        {
            name: "name",
            label: "Location Name",
            type: "text",
            placeholder: "Enter location name",
            required: true,
        },
        {
            name: "city",
            label: "City",
            type: "text",
            placeholder: "Enter city",
            required: true,
        },
        {
            name: "state",
            label: "State",
            type: "text",
            placeholder: "Enter state",
            required: true,
        },
        {
            name: "country",
            label: "Country",
            type: "text",
            placeholder: "Enter country",
        },
        {
            name: "pincode",
            label: "Pincode",
            type: "text",
            placeholder: "Enter pincode",
        },
        {
            name: "mapLink",
            label: "Location Map",
            type: "map",
            fullWidth: true,
        },
        {
            name: "isPopular",
            label: "Popular Location",
            type: "checkbox",
        },
        {
            name: "subLocations",
            label: "Sub Locations",
            type: "tags",
            fullWidth: true,
            placeholder: "Type a sub location and press Enter",
        },
        {
            name: "image",
            label: "Location Image",
            type: "file",
            fullWidth: true,
        },
    ];

    const handleSubmit = (values: Record<string, any>) => {
        const formData = new FormData();

        formData.append("name", values.name);
        formData.append("city", values.city);
        formData.append("state", values.state);
        formData.append("country", values.country);
        formData.append("pincode", values.pincode);
        formData.append("mapLink", values.mapLink);
        formData.append("isPopular", String(values.isPopular));

        formData.append(
            "subLocations",
            JSON.stringify(
                (values.subLocations || []).map(
                    (name: string, index: number) => ({
                        name,
                        isPopular: index === 0,
                    })
                )
            )
        );

        if (values.image instanceof File) {
            formData.append("image", values.image);
        }

        if (selectedLocation?._id) {
            dispatch(
                updateLocation({
                    id: selectedLocation._id,
                    data: formData,
                })
            );
        } else {
            dispatch(createLocation(formData));
        }
    };


    const handleClose = () => {
        onClose();

    }
    return (
        <div className="p-6">
            <ReusableForm
                title={selectedLocation ? "Edit Location" : "Create Location"}
                fields={fields}
                initialValues={{
                    name: selectedLocation?.name || "",
                    city: selectedLocation?.city || "",
                    state: selectedLocation?.state || "",
                    country: selectedLocation?.country || "",
                    pincode: selectedLocation?.pincode || "",
                    mapLink: selectedLocation?.mapLink || "",
                    isPopular: selectedLocation?.isPopular || false,
                    subLocations:
                        selectedLocation?.subLocations?.map((item: any) => item.name) || [],
                    image: selectedLocation?.image || "",
                }}
                submitText={selectedLocation ? "Update Location" : "Create Location"}
                onSubmit={handleSubmit}
                onClose={handleClose}
            />

        </div>
    );
}