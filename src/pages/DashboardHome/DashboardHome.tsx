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
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { useSelector } from 'react-redux';
import { setBreadcrumbs } from '../../store/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { getDashboardStats } from '../../store/slice/statsSlice';
import CustomImage from '../../components/Image';

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

const OCCUPANCY_DATA = [
    { day: "Mon", occupancy: 62 },
    { day: "Tue", occupancy: 68 },
    { day: "Wed", occupancy: 74 },
    { day: "Thu", occupancy: 88 },
    { day: "Fri", occupancy: 82 },
    { day: "Sat", occupancy: 95 },
    { day: "Sun", occupancy: 97 },
];

const COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];





export default function DashboardHome() {
    const dispatch = useAppDispatch();
    const { stats } = useAppSelector((state: any) => state.stats);
    const { darkMode } = useSelector((state: any) => state.ui);

    useEffect(() => {
        dispatch(getDashboardStats());
    }, [dispatch]);

    useEffect(() => {
        dispatch(setBreadcrumbs([{ label: 'Dashboard' }]));
    }, [dispatch]);

    const summary = stats?.summary || {};
    const propertyTypes = stats?.distributions?.propertyTypes || [];
    const propertyActions = stats?.distributions?.propertyActions || [];
    const monthlyStats = stats?.monthlyStats || [];
    const topPerforming = stats?.topPerforming?.properties || [];
    const recentProperties = stats?.recentActivities?.properties || [];

    const totalRevenue = summary.totalRevenue || 0;
    const totalProperties = summary.totalProperties || 0;
    const totalUsers = summary.totalUsers || 0;
    const totalEnquiries = summary.totalEnquiries || 0;

    const formatCurrency = (amount: number): string => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        }
        return `₹${amount.toLocaleString()}`;
    };

    const propertyTypeData = propertyTypes.map((item: any) => ({
        name: item._id,
        value: item.count
    }));

    const monthlyData = monthlyStats.map((item: any) => ({
        month: `${item._id.month}/${item._id.year}`,
        properties: item.count
    }));

    const statCards = [
        {
            id: "stat-revenue",
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            trend: "+12.5%",
            isPositive: true,
            subtitle: "vs last month",
            icon: <DollarSign size={18} className="text-blue-500" />,
        },
        {
            id: "stat-properties",
            title: "Total Properties",
            value: totalProperties.toLocaleString(),
            trend: "+8.2%",
            isPositive: true,
            subtitle: "active properties",
            icon: <Package size={18} className="text-amber-500" />,
        },
        {
            id: "stat-users",
            title: "Total Users",
            value: totalUsers.toLocaleString(),
            trend: "+3.2%",
            isPositive: true,
            subtitle: "vs last month",
            icon: <Users size={18} className="text-emerald-500" />,
        },
        {
            id: "stat-enquiries",
            title: "Enquiries",
            value: totalEnquiries.toLocaleString(),
            trend: totalEnquiries > 0 ? "+5.1%" : "0%",
            isPositive: totalEnquiries > 0,
            subtitle: "total enquiries",
            icon: <ShoppingCart size={18} className="text-violet-500" />,
        },
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
                                    ? "bg-blue-50 dark:bg-blue-900/20"
                                    : card.id === "stat-properties"
                                        ? "bg-amber-50 dark:bg-amber-900/20"
                                        : card.id === "stat-users"
                                            ? "bg-emerald-50 dark:bg-emerald-900/20"
                                            : "bg-violet-50 dark:bg-violet-900/20"
                                    }`}
                            >
                                {card.icon}
                            </div>
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${card.isPositive
                                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
                                    : "text-rose-600 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400"
                                    }`}
                            >
                                {card.trend}
                            </span>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                                {card.value}
                            </h3>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6 lg:col-span-1">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Property Listings Trend</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Monthly property listings overview</p>
                        </div>
                        <div className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {monthlyData.length > 0 ? `+${monthlyData[monthlyData.length - 1]?.properties || 0} new` : 'No data'}
                        </div>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData.length > 0 ? monthlyData : CHART_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorProperties" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey={monthlyData.length > 0 ? "properties" : "revenue"} stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProperties)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Property Types</h3>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={propertyTypeData.length > 0 ? propertyTypeData : [{ name: 'No Data', value: 1 }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name ?? "Unknown"} ${((percent ?? 0) * 100).toFixed(0)}%`
                                    }
                                    labelLine={false}
                                >
                                    {(propertyTypeData.length > 0 ? propertyTypeData : [{ name: 'No Data', value: 1 }]).map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                        border: darkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: darkMode ? '#ffffff' : '#000000',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>



            <div className="grid grid-cols-1  gap-5">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Weekly Occupancy</h3>
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
                                <Tooltip
                                    formatter={(value) => [`${value}%`, "Occupancy"]}
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                        border: darkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: darkMode ? '#ffffff' : '#000000',
                                    }}
                                />
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="recent-assets-split">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-4">
                    <div className="mb-6">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            Property Actions
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Distribution by action type
                        </p>
                    </div>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={propertyActions.length > 0 ? propertyActions : [{ _id: 'Buy', count: 10 }]}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke={darkMode ? "#1e293b" : "#e5e7eb"}
                                />
                                <XAxis
                                    dataKey="_id"
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: "12px", fill: "#94a3b8" }}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    style={{ fontSize: "12px", fill: "#94a3b8" }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                                        border: darkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '11px',
                                        color: darkMode ? '#ffffff' : '#000000',
                                    }}
                                />
                                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                            </BarChart>
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
                        {(topPerforming.length > 0 ? topPerforming : TOP_PROPERTIES)
                            .slice(0, 4)
                            .map((property: any, index: number) => {
                                const imageUrl =
                                    property.propertyMedia?.find(
                                        (media: any) => media.type === "Image"
                                    )?.url;

                                return (
                                    <div
                                        key={property._id || index}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-slate-800">
                                                {imageUrl ? (
                                                    <CustomImage
                                                        src={imageUrl}
                                                        alt={property.name || "Property"}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold text-sm">
                                                        {property.name?.charAt(0) || "P"}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h4 className="text-sm capitalize font-semibold text-gray-900 dark:text-white line-clamp-1">
                                                    {property.name || "Property"}
                                                </h4>

                                                <p className="text-xs text-gray-400">
                                                    {property.location?.coordinates
                                                        ? `${property.location.coordinates[1]?.toFixed(4) || ""}, ${property.location.coordinates[0]?.toFixed(4) || ""}`
                                                        : "Location not available"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right flex-shrink-0 ml-3">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(property.totalPrice || 0)}
                                            </p>

                                            <div className="flex items-center justify-end gap-1 text-xs font-semibold text-emerald-500">
                                                <span>{property.visitCount || 0} views</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800/80 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Recent Properties</h3>
                    <div className="space-y-6" id="dashboard-timeline-list">
                        {(recentProperties.length > 0 ? recentProperties : []).slice(0, 4).map((property: any, idx: number) => {
                            return (
                                <div key={property._id || idx} className="flex gap-4 items-start relative">
                                    {idx !== Math.min((recentProperties.length > 0 ? recentProperties : []).slice(0, 4).length - 1, 3) && (
                                        <span className="absolute left-[11.5px] top-7 bottom-0 w-0.5 bg-gray-100 dark:bg-slate-800/60" />
                                    )}
                                    <div className="w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 bg-white dark:bg-slate-900 border-indigo-200 text-indigo-500 dark:border-indigo-800/40">
                                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs capitalize text-gray-700 dark:text-gray-300 font-medium line-clamp-2">
                                            {property.name || 'Property'}
                                        </p>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-1">
                                            {property.propertyType?.name || 'N/A'} • {formatCurrency(property.totalPrice || 0)}
                                        </span>
                                        <span className="text-[10px] text-gray-400 dark:text-gray-500 block mt-0.5">
                                            {property.address?.city || ''}, {property.address?.state || ''}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                        {recentProperties.length === 0 && (
                            <div className="text-center text-gray-400 text-sm py-8">
                                No recent properties
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}