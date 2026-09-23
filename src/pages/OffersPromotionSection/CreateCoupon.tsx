import { useDispatch, useSelector } from "react-redux";
import ReusableForm, { type FormField } from "../../components/ReusableForm";
import { createCoupon, updateCoupon } from "../../store/slice/couponSlice";
import { type Coupon, type CreateCouponPayload } from "../../types";
import type { RootState, AppDispatch } from "../../store/store";

interface CouponCreateProps {
  coupon?: Coupon | null;
  onClose?: () => void;
}

export default function CouponCreate({ coupon, onClose }: CouponCreateProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { isLoading } = useSelector((state: RootState) => state.coupon);

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
      name: "discountType",
      label: "Discount Type",
      type: "select",
      required: true,
      options: [
        {
          label: "Percentage",
          value: "percentage",
        },
        {
          label: "Fixed Amount",
          value: "fixed",
        },
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
      name: "maximumDiscount",
      label: "Maximum Discount",
      type: "number",
      placeholder: "e.g. 1000",
      required: false,
      fullWidth: false,
    },
    {
      name: "minimumOrder",
      label: "Minimum Order",
      type: "number",
      placeholder: "e.g. 1500",
      required: false,
      fullWidth: false,
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
      required: true,
      fullWidth: false,
    },
    {
      name: "endDate",
      label: "End Date",
      type: "date",
      required: true,
      fullWidth: false,
    },
    {
      name: "usageLimit",
      label: "Usage Limit",
      type: "number",
      placeholder: "e.g. 100",
      required: false,
      fullWidth: false,
    },
    {
      name: "isActive",
      label: "Active",
      type: "checkbox",
      fullWidth: false,
    },
  ];

  const initialValues = {
    title: coupon?.title ?? "",
    code: coupon?.code ?? "",
    description: coupon?.description ?? "",
    discountType: coupon?.discountType ?? "percentage",
    discountValue: coupon?.discountValue ?? 0,
    maximumDiscount: coupon?.maximumDiscount ?? "",
    minimumOrder: coupon?.minimumOrder ?? 0,
    startDate: coupon?.startDate?.split("T")[0] ?? "",
    endDate: coupon?.endDate?.split("T")[0] ?? "",
    usageLimit: coupon?.usageLimit ?? 1,
    isActive: coupon?.isActive ?? true,
  };

  const handleSubmit = async (values: Record<string, any>) => {
    const payload: CreateCouponPayload = {
      title: values.title.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description?.trim() || "",
      discountType: values.discountType,
      discountValue: Number(values.discountValue),
      minimumOrder:
        values.minimumOrder !== "" && values.minimumOrder != null
          ? Number(values.minimumOrder)
          : 0,
      maximumDiscount:
        values.maximumDiscount !== "" && values.maximumDiscount != null
          ? Number(values.maximumDiscount)
          : 0,
      startDate: values.startDate,
      endDate: values.endDate,
      usageLimit:
        values.usageLimit !== "" && values.usageLimit != null
          ? Number(values.usageLimit)
          : 1,
      isActive: Boolean(values.isActive),
    };

    if (coupon) {
      await dispatch(
        updateCoupon({
          id: coupon._id,
          data: payload,
        }),
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
        title={coupon ? "Update Coupon" : "Create New Coupon"}
        fields={fields}
        initialValues={initialValues}
        submitText={coupon ? "Update Coupon" : "Create Coupon"}
        onSubmit={handleSubmit}
        onClose={handleClose}
        loading={isLoading}
      />
    </div>
  );
}
