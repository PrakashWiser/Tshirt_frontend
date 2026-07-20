import { useEffect, useMemo, useState } from "react";
import {
    Filter,
    Download,
    Plus,
    Tag,
    TrendingUp,
    Users,
    Percent,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import { DataTable } from "../../components/Taple";
import type { ColumnDef } from "../../components/Types";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
} from "recharts";
import CouponCreate from "./CreateCoupon";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import { clearCouponError, deleteCoupon, getAllCoupons, updateCouponStatus } from "../../store/slice/couponSlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import type { Coupon } from "../../types";

interface Stat {
    title: string;
    value: string;
    growth: string;
    icon: React.ElementType;
    color: string;
    description: string;
}



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

interface ChartData {
    name: string;
    bookings: number;
}

const stats: Stat[] = [
    {
        title: "Active Campaigns",
        value: "12",
        growth: "+25%",
        icon: Tag,
        color: "text-blue-600",
        description: "2 new this week",
    },
    {
        title: "Revenue Generated",
        value: "₹4.8L",
        growth: "+18.5%",
        icon: TrendingUp,
        color: "text-green-600",
        description: "From all campaigns",
    },
    {
        title: "Total Bookings",
        value: "1,247",
        growth: "+32%",
        icon: Users,
        color: "text-purple-600",
        description: "Last 30 days",
    },
    {
        title: "Average Conversion",
        value: "24.8%",
        growth: "+4.2%",
        icon: Percent,
        color: "text-orange-500",
        description: "Across all offers",
    },
];

const chartData: ChartData[] = [
    { name: "Summer Escape", bookings: 245 },
    { name: "Weekend Getaway", bookings: 189 },
    { name: "Goa Beach Special", bookings: 312 },
    { name: "Monsoon Offer", bookings: 156 },
    { name: "Early Bird", bookings: 278 },
    { name: "Corporate Package", bookings: 134 },
];





export default function OffersPromotionSection() {
    const dispatch = useAppDispatch();
    const { message, error, coupons } = useAppSelector(
        (state) => state.coupon
    );
    const [openCreate, setOpenCreate] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);




    useEffect(() => {
        dispatch(getAllCoupons())
    }, [dispatch])

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllCoupons());
            setOpenCreate(false)
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
                                        })
                                    );
                                }}
                            />

                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors">
                                <div
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isActive ? "translate-x-5" : ""
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
        [coupons, dispatch]
    );
    const tableData: TableRow[] = useMemo(() => {
        return coupons.map((coupon) => {
            const isExpired = new Date(coupon.validUntil) < new Date();
            return {
                id: coupon._id,
                title: coupon.title,
                promoCode: coupon.code,
                discount:
                    coupon.discountType === "percentage"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`,
                revenue: "₹0",
                bookings: coupon.usedCount ?? 0,
                conversion: "0%",
                status: isExpired
                    ? "Expired"
                    : (coupon.isActive ?? false)
                        ? "Active"
                        : "Paused",
                expiryDate: new Date(coupon.validUntil).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                }),
            };
        });
    }, [coupons, coupons]);



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


    const CHART_COLORS = ["#3b82f6", "#60a5fa", "#93bbfc", "#bfdbfe", "#dbeafe", "#eff6ff"];

    if (openCreate) {
        return (
            <CouponCreate
                coupon={selectedCoupon}
                onClose={() => setOpenCreate(false)}
            />
        )

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
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium">
                            <Filter size={18} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium">
                            <Download size={18} />
                            Export
                        </button>
                        <button
                            onClick={() => setOpenCreate(true)}
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 bg-black text-white rounded-md transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                            <Plus size={18} />
                            New Campaign
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        const isPositive = stat.growth.startsWith("+");

                        return (
                            <div
                                key={stat.title}
                                className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                            >
                                <div className="flex items-center justify-between">
                                    <div className={`p-2.5 rounded-xl bg-slate-50 ${stat.color}`}>
                                        <Icon size={20} />
                                    </div>
                                    <span
                                        className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                                            }`}
                                    >
                                        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                        {stat.growth}
                                    </span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mt-3 text-slate-900">
                                    {stat.value}
                                </h2>
                                <p className="text-sm text-slate-600 mt-0.5">{stat.title}</p>
                                <p className="text-xs text-slate-400 mt-1.5">{stat.description}</p>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-lg text-slate-900">
                                 Performance
                            </h3>
                            <p className="text-sm text-slate-500">Bookings generated per Offers</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl">
                            <Calendar size={16} />
                            Last 30 days
                        </div>
                    </div>
                    <div className="h-[300px] md:h-[360px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="horizontal" margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: "12px", fill: "#94a3b8" }}
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: "12px", fill: "#94a3b8" }}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
                                    contentStyle={{
                                        backgroundColor: "white",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "12px",
                                        padding: "8px 12px",
                                        fontSize: "13px",
                                    }}
                                    formatter={(value) => [`${value} bookings`, "Bookings"]}
                                />
                                <Bar dataKey="bookings" radius={[6, 6, 0, 0]} barSize={40}>
                                    {chartData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                                            className="transition-opacity duration-300 hover:opacity-80"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
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
                title="Are you sure you want to delete this booking?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteModal(false);
                    setDeleteId(null);
                }}
            />
        </>
    );
}