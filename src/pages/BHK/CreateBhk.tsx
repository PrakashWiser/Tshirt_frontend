import { useDispatch, useSelector } from "react-redux";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import {
    createBHK,
    updateBHK,
    getStatusOptions,
    type BHK,
    type CreateBHKPayload,
    type UpdateBHKPayload,
} from "../../store/slice/bhkSlice";
import type { RootState, AppDispatch } from "../../store/store";

interface CreateBHKProps {
    bhk?: BHK | null;
    onClose?: () => void;
}

export default function CreateBHK({ bhk, onClose }: CreateBHKProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { isLoading } = useSelector((state: RootState) => state.bhk);

    const fields: FormField[] = [
        {
            name: "name",
            label: "BHK Name",
            type: "text",
            placeholder: "e.g. 2 ",
            required: true,
            fullWidth: false,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Describe the BHK...",
            required: false,
            fullWidth: true,
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
        name: bhk?.name ?? "",
        description: bhk?.description ?? "",
        status: bhk?.status ?? "Active",
    };

    const handleSubmit = async (values: Record<string, any>) => {
        if (bhk) {
            const payload: UpdateBHKPayload = {
                name: values.name,
                description: values.description,
                status: values.status,
            };
            await dispatch(updateBHK({ id: bhk._id, data: payload }));
        } else {
            const payload: CreateBHKPayload = {
                name: values.name,
                description: values.description,
            };
            await dispatch(createBHK(payload));
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    return (
        <div className="p-6">
            <ReusableForm
                title={bhk ? "Edit BHK" : "Create New BHK"}
                fields={fields}
                initialValues={initialValues}
                submitText={bhk ? "Update BHK" : "Create BHK"}
                onSubmit={handleSubmit}
                onClose={handleClose}
                loading={isLoading}
            />
        </div>
    );
}