import { useDispatch, useSelector } from "react-redux";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import {
    createCoupon,
    updateCoupon,
} from "../../store/slice/couponSlice";
import {
    CouponTriggerType,
    getTriggerTypeOptions,
    type Coupon,
    type CreateCouponPayload,
} from "../../types";
import type { RootState, AppDispatch } from "../../store/store";

interface CouponCreateProps {
    coupon?: Coupon | null;
    onClose?: () => void;
}

export default function CouponCreate({
    coupon,
    onClose,
}: CouponCreateProps) {
    const dispatch = useDispatch<AppDispatch>();

    const { isLoading } = useSelector(
        (state: RootState) => state.coupon
    );


    const fields: FormField[] = [
        {
            name: "title",
            label: "Title",
            type: "text",
            placeholder: "e.g. Welcome Offer",
            required: true,
            fullWidth: false,
        },
        {
            name: "code",
            label: "Coupon Code",
            type: "text",
            placeholder: "e.g. WELCOME10",
            required: true,
            fullWidth: false,
        },
        {
            name: "description",
            label: "Description",
            type: "textarea",
            placeholder: "Describe the coupon and its benefits...",
            required: false,
            fullWidth: true,
        },
        {
            name: "triggerType",
            label: "Trigger Type",
            type: "select",
            required: true,
            options: getTriggerTypeOptions(),
            fullWidth: false,
        },
        {
            name: "discountType",
            label: "Discount Type",
            type: "select",
            required: true,
            options: [
                { label: "Percentage", value: "percentage" },
                { label: "Fixed Amount", value: "fixed" },
            ],
            fullWidth: false,
        },
        {
            name: "discountValue",
            label: "Discount Value",
            type: "number",
            placeholder: "e.g. 10 or 500",
            required: true,
            fullWidth: false,
        },
        {
            name: "maxDiscountAmount",
            label: "Max Discount Amount",
            type: "number",
            placeholder: "e.g. 1000 (for percentage discounts)",
            required: false,
            fullWidth: false,
        },
        {
            name: "minimumBookingAmount",
            label: "Minimum Booking Amount",
            type: "number",
            placeholder: "e.g. 1500",
            required: false,
            fullWidth: false,
        },
        {
            name: "validFrom",
            label: "Valid From",
            type: "date",
            required: true,
            fullWidth: false,
        },
        {
            name: "validUntil",
            label: "Valid Until",
            type: "date",
            required: true,
            fullWidth: false,
        },
        {
            name: "perUserUsageLimit",
            label: "Per User Usage Limit",
            type: "number",
            placeholder: "e.g. 1",
            required: false,
            fullWidth: false,
        },
        {
            name: "firstBookingOnly",
            label: "First Booking Only",
            type: "checkbox",
            fullWidth: false,
        },
        {
            name: "showOnListing",
            label: "Show on Listing",
            type: "checkbox",
            fullWidth: false,
        },
        {
            name: "status",
            label: "Status",
            type: "select",
            required: true,
            options: [
                { label: "Active", value: 1 },
                { label: "Inactive", value: 0 },
            ],
            fullWidth: false,
        },
    ];

    const initialValues = {
        title: coupon?.title ?? "",
        code: coupon?.code ?? "",
        description: coupon?.description ?? "",
        triggerType: coupon?.triggerType ?? CouponTriggerType.ALL_USERS,
        discountType: coupon?.discountType ?? "percentage",
        discountValue: coupon?.discountValue ?? 0,
        maxDiscountAmount: coupon?.maxDiscountAmount ?? "",
        minimumBookingAmount: coupon?.minimumBookingAmount ?? "",
        validFrom: coupon?.validFrom?.split("T")[0] ?? "",
        validUntil: coupon?.validUntil?.split("T")[0] ?? "",
        perUserUsageLimit: coupon?.perUserUsageLimit ?? 1,
        firstBookingOnly: coupon?.firstBookingOnly ?? false,
        showOnListing: coupon?.showOnListing ?? true,
        status: coupon?.status ?? 1,
        applicableSources: coupon?.applicableSources ?? ["user_app"],
    };

    const handleSubmit = async (values: Record<string, any>) => {
        const payload: CreateCouponPayload = {
            title: values.title,
            code: values.code.toUpperCase(),
            description: values.description,
            triggerType: values.triggerType,
            discountType: values.discountType,
            discountValue: Number(values.discountValue),
            maxDiscountAmount: values.maxDiscountAmount
                ? Number(values.maxDiscountAmount)
                : undefined,
            minimumBookingAmount: values.minimumBookingAmount
                ? Number(values.minimumBookingAmount)
                : undefined,
            validFrom: values.validFrom,
            validUntil: values.validUntil,
            perUserUsageLimit: Number(values.perUserUsageLimit),
            firstBookingOnly: Boolean(values.firstBookingOnly),
            showOnListing: Boolean(values.showOnListing),
            status: Number(values.status),
            applicableSources: ["user_app"],
        };
        if (coupon) {
            await dispatch(
                updateCoupon({
                    id: coupon._id,
                    data: payload,
                })
            );
        } else {
            await dispatch(createCoupon(payload));
        }
    };

    const handleClose = () => {
        onClose?.();
    };

    return (
        <div className="p-6">
            <ReusableForm
                title="Create New Coupon"
                fields={fields}
                initialValues={initialValues}
                submitText="Create Coupon"
                onSubmit={handleSubmit}
                onClose={handleClose}
                loading={isLoading}
            />
        </div>
    );
}