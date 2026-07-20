import { useMemo } from "react";
import {
    IndianRupee,
    TrendingUp,
    RefreshCcw,
    AlertCircle,
    Download,
} from "lucide-react";
import { DataTable } from "../../components/Taple";
import type { ColumnDef } from "../../components/Types";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

interface Transaction {
    id: string;
    type: string;
    party: string;
    amount: string;
    date: string;
    method: string;
    status: string;
}

const transactions: Transaction[] = [
    {
        id: "TXN-48291",
        type: "Payment Received",
        party: "Priya Sharma",
        amount: "₹48,000",
        date: "Jun 17, 2026",
        method: "UPI",
        status: "Success",
    },
    {
        id: "TXN-48290",
        type: "Vendor Payout",
        party: "SwiftFix Maintenance",
        amount: "₹12,400",
        date: "Jun 17, 2026",
        method: "NEFT",
        status: "Processing",
    },
    {
        id: "TXN-48289",
        type: "Refund",
        party: "Ananya Iyer",
        amount: "₹8,200",
        date: "Jun 16, 2026",
        method: "Card",
        status: "Success",
    },
    {
        id: "TXN-48288",
        type: "Payment Received",
        party: "Vikram Nair",
        amount: "₹1,25,000",
        date: "Jun 16, 2026",
        method: "Net Banking",
        status: "Success",
    },
    {
        id: "TXN-48287",
        type: "Refund",
        party: "Deepika Rao",
        amount: "₹22,000",
        date: "Jun 15, 2026",
        method: "UPI",
        status: "Pending",
    },
];

const stats = [
    {
        title: "Total Revenue",
        value: "₹1.04Cr",
        growth: "+18%",
        icon: IndianRupee,
        color: "text-blue-600",
    },
    {
        title: "Vendor Payouts",
        value: "₹69.4L",
        growth: "+12%",
        icon: TrendingUp,
        color: "text-green-600",
    },
    {
        title: "Refunds Issued",
        value: "₹4.2L",
        growth: "+32%",
        icon: RefreshCcw,
        color: "text-orange-500",
    },
    {
        title: "Failed Txns",
        value: "3",
        growth: "-60%",
        icon: AlertCircle,
        color: "text-red-500",
    },
];


const revenueData = [
    { day: "Jun 1", revenue: 4, payout: 3, refund: 0.2 },
    { day: "Jun 3", revenue: 5, payout: 4, refund: 0.2 },
    { day: "Jun 5", revenue: 4.4, payout: 3.5, refund: 0.2 },
    { day: "Jun 7", revenue: 6.2, payout: 5, refund: 0.2 },
    { day: "Jun 9", revenue: 5.5, payout: 4.5, refund: 0.2 },
    { day: "Jun 11", revenue: 7.2, payout: 5.8, refund: 0.2 },
    { day: "Jun 13", revenue: 7.8, payout: 6, refund: 0.2 },
    { day: "Jun 15", revenue: 9.1, payout: 6.8, refund: 0.2 },
    { day: "Jun 17", revenue: 7.5, payout: 5.7, refund: 0.2 },
];

export default function PaymentSection() {
    const columns = useMemo<ColumnDef<Transaction>[]>(
        () => [
            {
                key: "id",
                header: "TRANSACTION ID",
                accessor: "id",
            },
            {
                key: "type",
                header: "TYPE",
                accessor: "type",
                render: (value) => {
                    const type = String(value);

                    const styles: Record<string, string> = {
                        "Payment Received":
                            "bg-green-100 text-green-700",
                        "Vendor Payout":
                            "bg-blue-100 text-blue-700",
                        Refund:
                            "bg-yellow-100 text-yellow-700",
                    };

                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type]}`}
                        >
                            {type}
                        </span>
                    );
                },
            },
            {
                key: "party",
                header: "PARTY",
                accessor: "party",
            },
            {
                key: "amount",
                header: "AMOUNT",
                accessor: "amount",
            },
            {
                key: "date",
                header: "DATE",
                accessor: "date",
            },
            {
                key: "method",
                header: "METHOD",
                accessor: "method",
            },
            {
                key: "status",
                header: "STATUS",
                accessor: "status",
                render: (value) => {
                    const status = String(value);

                    const styles: Record<string, string> = {
                        Success:
                            "bg-green-100 text-green-700",
                        Processing:
                            "bg-blue-100 text-blue-700",
                        Pending:
                            "bg-yellow-100 text-yellow-700",
                        Failed:
                            "bg-red-100 text-red-700",
                    };

                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}
                        >
                            {status}
                        </span>
                    );
                },
            },
        ],
        []
    );

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {stats?.map((item) => {
                    const Icon = item.icon;

                    return (
                        <div
                            key={item.title}
                            className="bg-white border border-slate-200 rounded-2xl p-5"
                        >
                            <div className="flex items-center justify-between">
                                <Icon
                                    size={18}
                                    className={item.color}
                                />

                                <span
                                    className={`text-xs font-medium ${item.growth.startsWith("-")
                                        ? "text-red-500"
                                        : "text-green-500"
                                        }`}
                                >
                                    {item.growth}
                                </span>
                            </div>

                            <h2 className="text-3xl font-bold mt-4">
                                {item.value}
                            </h2>

                            <p className="text-sm text-slate-500">
                                {item.title}
                            </p>
                        </div>
                    );
                })}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-semibold text-lg">
                    Revenue Flow
                </h3>

                <p className="text-sm text-slate-500 mb-4">
                    Revenue, payouts and refunds — last 17 days
                </p>

                <div className="h-[320px]">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <LineChart
                            data={revenueData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: -20,
                                bottom: 0,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="#e5e7eb"
                            />

                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                style={{
                                    fontSize: "12px",
                                    fill: "#94a3b8",
                                }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                style={{
                                    fontSize: "12px",
                                    fill: "#94a3b8",
                                }}
                            />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#2563eb"
                                strokeWidth={3}
                                dot={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="payout"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={false}
                            />

                            <Line
                                type="monotone"
                                dataKey="refund"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                        Revenue
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        Payouts
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-400" />
                        Refunds
                    </div>
                </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="font-semibold">
                        Recent Transactions
                    </h3>

                    <button className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                        <Download size={15} />
                        Export CSV
                    </button>
                </div>

                <div className="p-4">
                    <DataTable
                        data={transactions}
                        columns={columns}
                        rowKey="id"
                        defaultView="table"
                        searchKeys={[
                            "id",
                            "party",
                            "status",
                            "method",
                        ]}
                        searchPlaceholder="Search transactions..."
                    />
                </div>
            </div>
        </div>
    );
}