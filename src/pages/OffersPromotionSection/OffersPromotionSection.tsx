import { useEffect, useMemo, useState } from "react";
import { Download, Plus } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import CouponCreate from "./CreateCoupon";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
  clearCouponError,
  deleteCoupon,
  getAllCoupons,
  updateCouponStatus,
} from "../../store/slice/couponSlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import type { Coupon } from "../../types";
import { exportTableData } from "../../utils/exportToExcel";

interface TableRow {
  id: string;
  title: string;
  promoCode: string;
  discount: string;
  revenue: string;
  bookings: number;
  conversion: string;
  status: "Active" | "Paused" | "Expired";
  expiryDate: string;
}

export default function OffersPromotionSection() {
  const dispatch = useAppDispatch();

  const { message, error, coupons } = useAppSelector((state) => state.coupon);

  const [openCreate, setOpenCreate] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    dispatch(getAllCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      dispatch(addToast({ type: "success", text: message }));
      dispatch(getAllCoupons());
      setOpenCreate(false);
      setSelectedCoupon(null);
      dispatch(clearCouponError());
    }

    if (error) {
      dispatch(addToast({ type: "error", text: error }));
      dispatch(clearCouponError());
    }
  }, [message, error, dispatch]);

  const columns = useMemo<ColumnDef<TableRow>[]>(
    () => [
      {
        key: "campaign",
        header: "Title",
        accessor: "title",
      },
      {
        key: "promoCode",
        header: "Coupon CODE",
        accessor: "promoCode",
        render: (value) => (
          <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded-md">
            {String(value)}
          </span>
        ),
      },
      {
        key: "discount",
        header: "DISCOUNT",
        accessor: "discount",
      },
      {
        key: "revenue",
        header: "REVENUE",
        accessor: "revenue",
      },
      {
        key: "bookings",
        header: "BOOKINGS",
        accessor: "bookings",
      },
      {
        key: "conversion",
        header: "CONVERSION",
        accessor: "conversion",
      },
      {
        key: "status",
        header: "STATUS",
        accessor: "status",
        render: (_value, row) => {
          const coupon = coupons.find((c) => c._id === row.id);
          const isActive = coupon?.isActive ?? false;

          return (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isActive}
                onChange={() => {
                  if (!coupon) return;

                  dispatch(
                    updateCouponStatus({
                      id: coupon._id,
                      isActive: !coupon.isActive,
                    }),
                  );
                }}
              />

              <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors">
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isActive ? "translate-x-5" : ""
                  }`}
                />
              </div>
            </label>
          );
        },
      },
      {
        key: "expiryDate",
        header: "EXPIRY DATE",
        accessor: "expiryDate",
      },
      {
        key: "actions",
        header: "ACTIONS",
        accessor: "id",
        render: (_, row) => {
          return (
            <DotMenu
              onEdit={() => {
                const coupon = coupons.find((c) => c._id === row.id);

                setSelectedCoupon(coupon ?? null);
                setOpenCreate(true);
              }}
              onDelete={() => handleDelete(row.id)}
            />
          );
        },
      },
    ],
    [coupons, dispatch],
  );

  const tableData: TableRow[] = useMemo(() => {
    return coupons.map((coupon) => {
      const isExpired = new Date(coupon.endDate) < new Date();

      return {
        id: coupon._id,
        title: coupon.title ?? "",
        promoCode: coupon.code ?? "",
        discount:
          coupon.discountType === "percentage"
            ? `${coupon.discountValue}%`
            : `₹${coupon.discountValue}`,
        revenue: "₹0",
        bookings: coupon.usedCount ?? 0,
        conversion: "0%",
        status: isExpired ? "Expired" : coupon.isActive ? "Active" : "Paused",
        expiryDate: new Date(coupon.endDate).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    });
  }, [coupons]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    dispatch(deleteCoupon(deleteId));
    setDeleteModal(false);
    setDeleteId(null);
  };

  const handleExport = () => {
    exportTableData(tableData as any, columns, "Coupon");
  };

  const handleCreate = () => {
    setSelectedCoupon(null);
    setOpenCreate(true);
  };

  const handleClose = () => {
    setOpenCreate(false);
    setSelectedCoupon(null);
  };

  if (openCreate) {
    return <CouponCreate coupon={selectedCoupon} onClose={handleClose} />;
  }

  return (
    <>
      <div className="space-y-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Coupon & Offers
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage promotional Coupon and discount offers.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <Download size={18} />
              Export
            </button>

            <button
              onClick={handleCreate}
              className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-[#3A29AA] text-white rounded-md transition-colors text-sm font-medium shadow-sm hover:bg-[#2f218f] hover:shadow-md"
            >
              <Plus size={18} />
              New Campaign
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">All Coupons</h3>
          </div>

          <div className="p-4">
            <DataTable
              data={tableData}
              columns={columns}
              rowKey="id"
              defaultView="table"
              searchKeys={["title", "promoCode", "status"]}
              searchPlaceholder="Search campaigns..."
            />
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal}
        title="Are you sure you want to delete this coupon?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModal(false);
          setDeleteId(null);
        }}
      />
    </>
  );
}
