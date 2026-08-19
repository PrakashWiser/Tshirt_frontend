import { useDispatch, useSelector } from "react-redux";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import {
    createPropertyAction,
    updatePropertyAction,
    getStatusOptions,
    type PropertyAction,
} from "../../store/slice/propertyActionSlice";
import type { RootState, AppDispatch } from "../../store/store";

interface PropertyActionCreateProps {
    propertyAction?: PropertyAction | null;
    onClose?: () => void;
}

export default function PropertyActionCreate({
    propertyAction,
    onClose,
}: PropertyActionCreateProps) {
    const dispatch = useDispatch<AppDispatch>();

    const { isLoading } = useSelector(
        (state: RootState) => state.propertyAction
    );

    console.log(propertyAction);
    

    const fields: FormField[] = [
        {
            name: "name",
            label: "Action Name",
            type: "text",
            placeholder: "e.g. Buy, Rent, Plots",
            required: true,
            fullWidth: false,
        },
        {
            name: "isNew",
            label: "Mark as New",
            type: "checkbox",
            fullWidth: false,
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: getStatusOptions(),
            fullWidth: false,
        },
        {
            name: "propertyActionIcon",
            label: "Action Icon",
            type: "file",
            required: !propertyAction,
            fullWidth: true,
        },
    ];

    const initialValues = {
        name: propertyAction?.name ?? "",
        isNew: propertyAction?.isNew ?? false,
        status: propertyAction?.status ?? "Active",
        propertyActionIcon :propertyAction?.image
        
    };

    const handleSubmit = async (values: Record<string, any>) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("isNew", String(Boolean(values.isNew)));
        if (propertyAction) {
            formData.append("status", values.status);
        }
        const iconFile = values.propertyActionIcon;
        if (iconFile instanceof File) {
            formData.append("propertyActionIcon", iconFile);
        }
        if (propertyAction) {
            await dispatch(
                updatePropertyAction({
                    id: propertyAction._id,
                    data: formData,
                })
            );
        } else {
            await dispatch(createPropertyAction(formData));
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    return (
        <div className="p-6">
            <ReusableForm
                title={propertyAction ? "Edit Property Action" : "Create New Property Action"}
                fields={fields}
                initialValues={initialValues}
                submitText={propertyAction ? "Update Action" : "Create Action"}
                onSubmit={handleSubmit}
                onClose={handleClose}
                loading={isLoading}
            />
        </div>
    );
}
