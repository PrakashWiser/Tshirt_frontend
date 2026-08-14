import { useDispatch, useSelector } from "react-redux";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import {
    createPropertyAction,
    updatePropertyAction,
    getStatusOptions,
    type PropertyAction,
    type CreatePropertyActionPayload,
    type UpdatePropertyActionPayload,
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
    ];

    const initialValues = {
        name: propertyAction?.name ?? "",
        isNew: propertyAction?.isNew ?? false,
        status: propertyAction?.status ?? "Active",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        if (propertyAction) {
            const payload: UpdatePropertyActionPayload = {
                name: values.name,
                isNew: Boolean(values.isNew),
                status: values.status,
            };

            await dispatch(
                updatePropertyAction({
                    id: propertyAction._id,
                    data: payload,
                })
            );
        } else {
            const payload: CreatePropertyActionPayload = {
                name: values.name,
                isNew: Boolean(values.isNew),
            };

            await dispatch(createPropertyAction(payload));
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
