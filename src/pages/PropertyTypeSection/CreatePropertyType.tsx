import { useDispatch, useSelector } from "react-redux";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import {
    createPropertyType,
    updatePropertyType,
    getStatusOptions,
    type PropertyType,
    type CreatePropertyTypePayload,
    type UpdatePropertyTypePayload,
} from "../../store/slice/propertyTypeSlice";
import type { RootState, AppDispatch } from "../../store/store";

interface PropertyTypeCreateProps {
    propertyType?: PropertyType | null;
    onClose?: () => void;
}

export default function PropertyTypeCreate({
    propertyType,
    onClose,
}: PropertyTypeCreateProps) {
    const dispatch = useDispatch<AppDispatch>();

    const { isLoading } = useSelector(
        (state: RootState) => state.propertyType
    );

    const fields: FormField[] = [
        {
            name: "name",
            label: "Property Type Name",
            type: "text",
            placeholder: "e.g. Apartment",
            required: true,
            fullWidth: false,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Describe the property type...",
            required: false,
            fullWidth: true,
        },
        // {
        //     name: "icon",
        //     label: "Icon",
        //     type: "text",
        //     placeholder: "e.g. apartment",
        //     required: false,
        //     fullWidth: false,
        // },
        // {
        //     name: "sortOrder",
        //     label: "Sort Order",
        //     type: "number",
        //     placeholder: "e.g. 1",
        //     required: false,
        //     fullWidth: false,
        // },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: getStatusOptions(),
            fullWidth: false,
        },
    ];

    const initialValues = {
        name: propertyType?.name ?? "",
        description: propertyType?.description ?? "",
        icon: propertyType?.icon ?? "",
        sortOrder: propertyType?.sortOrder ?? 0,
        status: propertyType?.status ?? "Active",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        if (propertyType) {
            const payload: UpdatePropertyTypePayload = {
                name: values.name,
                description: values.description,
                icon: values.icon,
                sortOrder: Number(values.sortOrder),
                status: values.status,
            };

            await dispatch(
                updatePropertyType({
                    id: propertyType._id,
                    data: payload,
                })
            );
        } else {
            const payload: CreatePropertyTypePayload = {
                name: values.name,
                description: values.description,
                icon: values.icon,
                sortOrder: Number(values.sortOrder),
            };

            await dispatch(createPropertyType(payload));
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    return (
        <div className="p-6">
            <ReusableForm
                title={propertyType ? "Edit Property Type" : "Create New Property Type"}
                fields={fields}
                initialValues={initialValues}
                submitText={propertyType ? "Update Property Type" : "Create Property Type"}
                onSubmit={handleSubmit}
                onClose={handleClose}
                loading={isLoading}
            />
        </div>
    );
}