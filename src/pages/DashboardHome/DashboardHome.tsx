import { useEffect } from "react";
import {
  TrendingUp,
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
import { useSelector } from "react-redux";
import { setBreadcrumbs } from "../../store/slice/uiSlice";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { getDashboardStats } from "../../store/slice/statsSlice";
import CustomImage from "../../components/Image";

const CHART_DATA = [
  { month: "Jan", revenue: 18000, orders: 110 },
  { month: "Feb", revenue: 22000, orders: 135 },
  { month: "Mar", revenue: 27000, orders: 160 },
  { month: "Apr", revenue: 31000, orders: 190 },
  { month: "May", revenue: 36000, orders: 220 },
  { month: "Jun", revenue: 42000, orders: 260 },
];

const TOP_PRODUCTS = [
  {
    id: 1,
    name: "Classic Black Tee",
    category: "Unisex",
    revenue: "₹18,400",
    sales: "420 sold",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
  },
  {
    id: 2,
    name: "Oversized White Tee",
    category: "Premium",
    revenue: "₹15,200",
    sales: "360 sold",
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=300",
  },
  {
    id: 3,
    name: "Striped Summer Tee",
    category: "Summer",
    revenue: "₹12,900",
    sales: "290 sold",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300",
  },
  {
    id: 4,
    name: "Graphic Street Tee",
    category: "Limited",
    revenue: "₹21,300",
    sales: "410 sold",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300",
  },
];

const CATEGORY_DATA = [
  { name: "Oversized", value: 34 },
  { name: "Classic", value: 26 },
  { name: "Graphic", value: 22 },
  { name: "Premium", value: 18 },
];

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
  const { stats } = useAppSelector((state: any) => state.stats);
  const { darkMode } = useSelector((state: any) => state.ui);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setBreadcrumbs([{ label: "Dashboard" }]));
  }, [dispatch]);

  const summary = stats?.summary || {};
  const propertyTypes = stats?.distributions?.propertyTypes || [];
  const propertyActions = stats?.distributions?.propertyActions || [];
  const monthlyStats = stats?.monthlyStats || [];
  const topPerforming = stats?.topPerforming?.properties || [];
  const recentProperties = stats?.recentActivities?.properties || [];

  const totalRevenue = summary.totalRevenue || 0;
  const totalProducts = summary.totalProperties || 0;
  const totalUsers = summary.totalUsers || 0;
  const totalOrders = summary.totalBookings || 0;

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const categoryData =
    propertyTypes.length > 0
      ? propertyTypes.map((item: any) => ({
          name: item._id,
          value: item.count,
        }))
      : CATEGORY_DATA;
  const monthlyData =
    monthlyStats.length > 0
      ? monthlyStats.map((item: any) => ({
          month: `${item._id.month}/${item._id.year}`,
          revenue: item.count,
        }))
      : CHART_DATA;

  const statCards = [
    {
      id: "stat-revenue",
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      trend: "+12.5%",
      isPositive: true,
      subtitle: "vs last month",
      icon: <DollarSign size={18} className="text-orange-500" />,
    },
    {
      id: "stat-products",
      title: "Products",
      value: totalProducts.toLocaleString(),
      trend: "+8.2%",
      isPositive: true,
      subtitle: "active listings",
      icon: <Shirt size={18} className="text-amber-500" />,
    },
    {
      id: "stat-customers",
      title: "Customers",
      value: totalUsers.toLocaleString(),
      trend: "+3.2%",
      isPositive: true,
      subtitle: "registered users",
      icon: <Users size={18} className="text-emerald-500" />,
    },
    {
      id: "stat-orders",
      title: "Orders",
      value: totalOrders.toLocaleString(),
      trend: "+5.1%",
      isPositive: true,
      subtitle: "this month",
      icon: <ShoppingCart size={18} className="text-violet-500" />,
    },
  ];

  return (
    <div className="space-y-8" id="dashboard-home-page">
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
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                {card.trend}
              </span>
            </div>
            <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {card.value}
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
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
            <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              +18.4%
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
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
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-base font-bold text-slate-900 dark:text-white">
            Category split
          </h3>
          <div className="h-65 w-full">
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
                  {categoryData.map((entry: any, index: number) => (
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  propertyActions.length > 0
                    ? propertyActions
                    : [
                        { _id: "Classic", count: 140 },
                        { _id: "Premium", count: 120 },
                        { _id: "Graphic", count: 102 },
                      ]
                }
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={darkMode ? "#1e293b" : "#e2e8f0"}
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
                    backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                    border: darkMode
                      ? "1px solid #1e293b"
                      : "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: darkMode ? "#ffffff" : "#000000",
                  }}
                />
                <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
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
            {(topPerforming.length > 0 ? topPerforming : TOP_PRODUCTS)
              .slice(0, 4)
              .map((product: any, index: number) => (
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
                        {product.category || "Category"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {product.revenue ||
                        formatCurrency(product.totalPrice || 0)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.sales || `${product.visitCount || 0} sold`}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-6 text-base font-bold text-slate-900 dark:text-white">
          Recent activity
        </h3>
        <div className="space-y-4">
          {(recentProperties.length > 0 ? recentProperties : TOP_PRODUCTS)
            .slice(0, 4)
            .map((item: any, index: number) => (
              <div
                key={item._id || index}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.name || "New product update"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.category || "Store activity"} •{" "}
                    {item.sales || "New listing"}
                  </p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                  <Package size={16} />
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
