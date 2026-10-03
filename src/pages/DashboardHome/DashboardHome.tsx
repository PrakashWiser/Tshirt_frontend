import { useEffect } from "react";
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Shirt,
  Layers3,
} from "lucide-react";
import { Link } from "react-router-dom";
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
} from "recharts";
import { setBreadcrumbs } from "../../store/slice/uiSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getDashboardStats } from "../../store/slice/statsSlice";
import CustomImage from "../../components/Image";

const COLORS = [
  "#f97316",
  "#111827",
  "#facc15",
  "#ef4444",
  "#a78bfa",
  "#14b8a6",
];

export default function DashboardHome() {
  const dispatch = useAppDispatch();
  const { stats, isLoading, error } = useAppSelector((state) => state.stats);
  const { darkMode } = useAppSelector((state) => state.ui);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBreadcrumbs([{ label: "Dashboard" }]));
  }, [dispatch]);

  const summary = stats?.summary;
  const productTypes = stats?.distributions?.productTypes || [];
  const monthlyStats = stats?.monthlyStats || [];
  const topProducts =
    stats?.topProducts || stats?.topPerforming?.products || [];
  const recentActivities = stats?.recentActivities?.activities || [];

  const totalRevenue = summary?.totalRevenue ?? 0;
  const totalProducts = summary?.totalProducts ?? stats?.totalProducts ?? 0;
  const totalUsers = summary?.totalUsers ?? stats?.totalUsers ?? 0;
  const totalOrders = summary?.totalOrders ?? stats?.totalOrders ?? 0;

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const categoryData = productTypes.map((item) => ({
    name: item._id,
    value: item.count,
  }));
  const monthlyData = monthlyStats.map((item) => ({
    month: new Date(item.year, item.month - 1).toLocaleDateString("en-IN", {
      month: "short",
      year: "2-digit",
    }),
    revenue: item.revenue,
  }));
  const salesByProduct = topProducts.map((product) => ({
    name: product.name,
    quantitySold: product.quantitySold,
  }));

  const statCards = [
    {
      id: "stat-revenue",
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      subtitle: "paid and delivered orders",
      icon: <DollarSign size={18} className="text-orange-500" />,
    },
    {
      id: "stat-products",
      title: "Products",
      value: totalProducts.toLocaleString(),
      subtitle: "all store products",
      icon: <Shirt size={18} className="text-amber-500" />,
    },
    {
      id: "stat-customers",
      title: "Customers",
      value: totalUsers.toLocaleString(),
      subtitle: "registered users",
      icon: <Users size={18} className="text-emerald-500" />,
    },
    {
      id: "stat-orders",
      title: "Orders",
      value: totalOrders.toLocaleString(),
      subtitle: "all store orders",
      icon: <ShoppingCart size={18} className="text-violet-500" />,
    },
  ];

  return (
    <div className="space-y-8" id="dashboard-home-page">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            id={card.id}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-500/10">
                {card.icon}
              </div>
            </div>
            <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {isLoading && !stats ? "—" : card.value}
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {card.title}
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {card.subtitle}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Revenue trend
              </h3>
              <p className="text-xs text-slate-400">
                Monthly order revenue overview
              </p>
            </div>
            <p className="text-xs text-slate-400">Last 6 months</p>
          </div>
          <div className="h-72 w-full">
            {monthlyData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="revenueFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#f97316"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={darkMode ? "#1e293b" : "#e2e8f0"}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    style={{ fontSize: "10px", fill: "#94a3b8" }}
                  />
                  <YAxis
                    tickLine={false}
                    style={{ fontSize: "10px", fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                      border: darkMode
                        ? "1px solid #1e293b"
                        : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: darkMode ? "#ffffff" : "#000000",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={3}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                {isLoading
                  ? "Loading revenue data..."
                  : "No paid order revenue yet"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Sales by product
            </h3>
            <Layers3 className="h-4 w-4 text-orange-500" />
          </div>
          <div className="h-65 w-full">
            {salesByProduct.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByProduct}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={darkMode ? "#1e293b" : "#e2e8f0"}
                  />
                  <XAxis
                    dataKey="name"
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
                      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                      border: darkMode
                        ? "1px solid #1e293b"
                        : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: darkMode ? "#ffffff" : "#000000",
                    }}
                  />
                  <Bar
                    dataKey="quantitySold"
                    fill="#f97316"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                {isLoading ? "Loading sales data..." : "No product sales yet"}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Top products
            </h3>
            <Link
              to="/products"
              className="text-xs font-semibold text-orange-600 hover:text-orange-500"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-4">
            {topProducts.slice(0, 4).length > 0 ? (
              topProducts.slice(0, 4).map((product, index) => (
                <div
                  key={product._id || index}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      {product.image ? (
                        <CustomImage
                          src={product.image}
                          alt={product.name || "Product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-orange-400 to-amber-500 font-bold text-white">
                          {product.name?.charAt(0) || "T"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {product.name || "Product"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {product.quantitySold.toLocaleString()} sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {isLoading ? "Loading top products..." : "No product sales yet"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-base font-bold text-slate-900 dark:text-white">
            Category split
          </h3>
          <div className="h-65 w-full">
            {categoryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name || index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                      border: darkMode
                        ? "1px solid #1e293b"
                        : "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: darkMode ? "#ffffff" : "#000000",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">
                {isLoading
                  ? "Loading category data..."
                  : "No product category data yet"}
              </div>
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-base font-bold text-slate-900 dark:text-white">
            Recent activity
          </h3>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 4).map((item, index) => (
                <div
                  key={`${item.resourceId || item.action}-${item.createdAt}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      {item.image ? (
                        <CustomImage
                          src={item.image}
                          alt={item.description}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                          <Package size={18} />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.description}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.actor?.name || item.type} •{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                {isLoading
                  ? "Loading recent activity..."
                  : "No recent activity"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
