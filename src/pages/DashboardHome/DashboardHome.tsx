import { useEffect } from 'react';
import {
    TrendingUp,
    ShoppingCart,
    Package,
    Users,
    DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip
} from 'recharts';
import { useSelector } from 'react-redux';
import { setBreadcrumbs } from '../../store/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { getDashboardStats } from '../../store/slice/statsSlice';

const DUMMY_USERS = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
    { id: 4, name: 'Alice Williams', email: 'alice@example.com', status: 'Active' },
    { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', status: 'Active' },
    { id: 6, name: 'Diana Prince', email: 'diana@example.com', status: 'Inactive' },
    { id: 7, name: 'Edward Norton', email: 'edward@example.com', status: 'Active' },
    { id: 8, name: 'Fiona Apple', email: 'fiona@example.com', status: 'Active' },
];

const DUMMY_PRODUCTS = [
    { id: 1, name: 'Premium VPN', price: 99.99, status: 'Active', category: 'Security' },
    { id: 2, name: 'Cloud Storage Pro', price: 149.99, status: 'Active', category: 'Storage' },
    { id: 3, name: 'Team Collaboration Suite', price: 299.99, status: 'Draft', category: 'Productivity' },
    { id: 4, name: 'AI Analytics Platform', price: 499.99, status: 'Active', category: 'Analytics' },
    { id: 5, name: 'API Gateway Enterprise', price: 199.99, status: 'Active', category: 'Infrastructure' },
    { id: 6, name: 'Database Cluster', price: 399.99, status: 'Draft', category: 'Infrastructure' },
];

const DUMMY_ORDERS = [
    { id: 1, orderNumber: 'ORD-2026-001', customerName: 'TechCorp Inc.', totalAmount: 1499.99, status: 'Processing' },
    { id: 2, orderNumber: 'ORD-2026-002', customerName: 'DataFlow Systems', totalAmount: 899.50, status: 'Delivered' },
    { id: 3, orderNumber: 'ORD-2026-003', customerName: 'CloudNine Solutions', totalAmount: 2499.00, status: 'Pending' },
    { id: 4, orderNumber: 'ORD-2026-004', customerName: 'Quantum Industries', totalAmount: 3499.99, status: 'Shipped' },
    { id: 5, orderNumber: 'ORD-2026-005', customerName: 'Innovation Labs', totalAmount: 1299.99, status: 'Cancelled' },
    { id: 6, orderNumber: 'ORD-2026-006', customerName: 'SmartTech LLC', totalAmount: 799.99, status: 'Processing' },
    { id: 7, orderNumber: 'ORD-2026-007', customerName: 'Global Systems', totalAmount: 1899.99, status: 'Delivered' },
    { id: 8, orderNumber: 'ORD-2026-008', customerName: 'Digital Dynamics', totalAmount: 2599.99, status: 'Pending' },
];

const DUMMY_TIMELINE = [
    { id: 1, action: 'Platform database successfully scaled', target: 'Quantum DB Cluster', time: '12 minutes ago', type: 'system' },
    { id: 2, action: 'User added to engineering support division', target: 'David Kim', time: '1 hour ago', type: 'user' },
    { id: 3, action: 'Fulfillment order generated', target: 'ORD-2026-7788', time: '3 hours ago', type: 'order' },
    { id: 4, action: 'Assigned draft release flag status to product', target: 'VPN Tunnel Pro', time: '1 day ago', type: 'product' },
];

const CHART_DATA = [
    { month: 'Jan', revenue: 4200, users: 400 },
    { month: 'Feb', revenue: 5100, users: 550 },
    { month: 'Mar', revenue: 6800, users: 800 },
    { month: 'Apr', revenue: 8500, users: 1100 },
    { month: 'May', revenue: 11200, users: 1450 },
    { month: 'Jun', revenue: 15400, users: 2100 },
];


const TOP_PROPERTIES = [
    {
        id: 1,
        name: "Skyline Suites",
        city: "Mumbai",
        revenue: "₹18.4L",
        occupancy: "94% occ.",
        image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200",
    },
    {
        id: 2,
        name: "The Pearl Residency",
        city: "Chennai",
        revenue: "₹12.1L",
        occupancy: "71% occ.",
        image:
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200",
    },
    {
        id: 3,
        name: "Azure Heights",
        city: "Bengaluru",
        revenue: "₹15.7L",
        occupancy: "88% occ.",
        image:
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200",
    },
    {
        id: 4,
        name: "Grand Vista",
        city: "Delhi",
        revenue: "₹21.3L",
        occupancy: "97% occ.",
        image:
            "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=200",
    },
];

export default function DashboardHome() {
    const dispatch = useAppDispatch();

    const { stats } = useAppSelector(
        (state) => state.stats
    );

    console.log(stats);

    useEffect(() => {
        dispatch(getDashboardStats());
    }, [dispatch]);

    const { darkMode } = useSelector((state: any) => state.ui);

    useEffect(() => {
        dispatch(setBreadcrumbs([{ label: 'Dashboard' }]));
    }, [dispatch]);

    const activeUsersCount = DUMMY_USERS.filter((u) => u.status === 'Active').length;
    const totalProductsCount = DUMMY_PRODUCTS.length;
    const pendingOrders = DUMMY_ORDERS.filter((o) => o.status === 'Processing' || o.status === 'Pending');

    const totalRevenue = DUMMY_ORDERS
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const statCards = [
        {
            id: "stat-revenue",
            title: "Total Revenue",
            value: `$${totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`,
            trend: "+12.5%",
            isPositive: true,
            subtitle: "vs last month",
            icon: <DollarSign size={18} className="text-blue-500" />,
            chart: (
                <svg viewBox="0 0 100 40" className="w-24 h-10">
                    <path
                        d="M5 30 L20 28 L35 18 L50 10 L65 16 L80 4 L95 2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-blue-500"
                    />
                </svg>
            ),
        },
        {
            id: "stat-users",
            title: "Active Users",
            value: activeUsersCount.toLocaleString(),
            trend: "+3.2%",
            isPositive: true,
            subtitle: "vs last month",
            icon: <Users size={18} className="text-emerald-500" />,
            chart: (
                <svg viewBox="0 0 100 40" className="w-24 h-10">
                    <path
                        d="M5 35 L20 22 L35 16 L50 8 L65 2 L80 12 L95 8"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-emerald-500"
                    />
                </svg>
            ),
        },
        {
            id: "stat-products",
            title: "Products",
            value: totalProductsCount.toLocaleString(),
            trend: "+4.8%",
            isPositive: true,
            subtitle: "active products",
            icon: <Package size={18} className="text-amber-500" />,
            chart: (
                <svg viewBox="0 0 100 40" className="w-24 h-10">
                    <path
                        d="M5 30 L18 12 L30 32 L45 10 L60 6 L72 18 L88 8 L95 10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-amber-500"
                    />
                </svg>
            ),
        },
        {
            id: "stat-orders",
            title: "Pending Orders",
            value: pendingOrders.length.toLocaleString(),
            trend: "-1.2%",
            isPositive: false,
            subtitle: "vs last week",
            icon: <ShoppingCart size={18} className="text-violet-500" />,
            chart: (
                <svg viewBox="0 0 100 40" className="w-24 h-10">
                    <path
                        d="M5 32 L20 18 L35 20 L50 10 L65 4 L80 5 L95 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-violet-500"
                    />
                </svg>
            ),
        },
    ];

    const OCCUPANCY_DATA = [
        { day: "Mon", occupancy: 62 },
        { day: "Tue", occupancy: 68 },
        { day: "Wed", occupancy: 74 },
        { day: "Thu", occupancy: 88 },
        { day: "Fri", occupancy: 82 },
        { day: "Sat", occupancy: 95 },
        { day: "Sun", occupancy: 97 },
    ];



    return (
        <div className="space-y-8" id="dashboard-home-page">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards?.map((card) => (
                    <div
                        key={card.id}
                        className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-md"
                        id={card.id}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.id === "stat-revenue"
                                    ? "bg-blue-50"
                                    : card.id === "stat-users"
                                        ? "bg-emerald-50"
                                        : card.id === "stat-products"
                                            ? "bg-amber-50"
                                            : "bg-violet-50"
                                    }`}
                            >
                                {card.icon}
                            </div>

                            <div className="w-20 h-8 flex items-center justify-end">
                                {card.chart}
                            </div>
                        </div>

                        <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                                {card.value}
                            </h3>

                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.isPositive
                                    ? "text-emerald-600 bg-emerald-50"
                                    : "text-rose-600 bg-rose-50"
                                    }`}
                            >
                                {card.trend}
                            </span>
                        </div>

                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 truncate">
                            {card.title}
                        </p>

                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">
                            {card.subtitle}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1  gap-8" id="charts-grid">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Revenue Analtics</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Monthly performance overview across all properties</p>
                        </div>
                        <div className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Solid +12.4%
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? '#1e293b' : '#f1f5f9'} />
                                <XAxis dataKey="month" tickLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                                <YAxis tickLine={false} style={{ fontSize: '10px', fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                        border: darkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: darkMode ? '#ffffff' : '#000000',
                                    }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="recent-assets-split">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4">
                    <div className="mb-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Weekly Occupancy
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Avg across all properties
                        </p>
                    </div>

                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={OCCUPANCY_DATA}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke={darkMode ? "#1e293b" : "#e5e7eb"}
                                />

                                <XAxis
                                    dataKey="day"
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: "12px", fill: "#94a3b8" }}
                                />

                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: "12px", fill: "#94a3b8" }}
                                />

                                <Tooltip formatter={(value) => [`${value}%`, "Occupancy"]} />

                                <defs>
                                    <linearGradient id="occupancyFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>

                                <Area
                                    type="monotone"
                                    dataKey="occupancy"
                                    stroke="#22c55e"
                                    strokeWidth={3}
                                    fill="url(#occupancyFill)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Top Properties
                        </h3>

                        <Link
                            to="/properties"
                            className="text-xs text-indigo-600 hover:text-indigo-400 font-semibold"
                        >
                            View all →
                        </Link>
                    </div>

                    <div className="space-y-5">
                        {TOP_PROPERTIES?.map((property) => (
                            <div
                                key={property?.id}
                                className="flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={property?.image}
                                        alt={property?.name}
                                        className="w-12 h-12 rounded-xl object-cover"
                                    />

                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {property.name}
                                        </h4>

                                        <p className="text-xs text-gray-400">
                                            {property.city}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                        {property.revenue}
                                    </p>

                                    <div className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-500">
                                        <span>{property.occupancy}</span>
                                        <span>↗</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Activity Audit Log</h3>
                    <div className="space-y-6" id="dashboard-timeline-list">
                        {DUMMY_TIMELINE?.map((item, idx) => {
                            return (
                                <div key={item.id} className="flex gap-4 items-start relative">
                                    {idx !== DUMMY_TIMELINE?.length - 1 && (
                                        <span className="absolute left-[11.5px] top-7 bottom-0 w-0.5 bg-gray-100 dark:bg-slate-800/60" />
                                    )}

                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-900
                    ${item.type === 'system' ? 'border-indigo-200 text-indigo-500 dark:border-indigo-800/40' : ''}
                    ${item.type === 'user' ? 'border-amber-200 text-amber-500 dark:border-amber-800/40' : ''}
                    ${item.type === 'order' ? 'border-emerald-200 text-emerald-500 dark:border-emerald-800/40' : ''}
                    ${item.type === 'product' ? 'border-blue-200 text-blue-500 dark:border-blue-800/40' : ''}
                  `}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    </div>

                                    <div className="overflow-hidden">
                                        <p className="text-xs text-gray-700 dark:text-gray-300 font-medium">
                                            {item.action}: <span className="font-bold text-gray-900 dark:text-white">{item.target}</span>
                                        </p>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-1">
                                            {item.time}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}