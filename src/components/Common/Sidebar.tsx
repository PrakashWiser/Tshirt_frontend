import {
    LayoutDashboard,
    Building2,
    BedDouble,
    DollarSign,
    CalendarDays,
    Users,
    Store,
    CreditCard,
    Tag,
    Star,
    BarChart3,
    Shield,
    ClipboardList,
    LogOut,
    X,
    House,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { SidebarProps } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import CustomImage from "../Image";
import { logoutUser } from "../../store/slice/authSlice";

const MOBILE_BREAKPOINT = 1024;

export default function Sidebar({
    sidebarOpen,
    setSidebarOpen,
}: SidebarProps) {
    const navigate = useNavigate();
    const { user } = useAppSelector((state: any) => state.auth);
    const dispatch = useAppDispatch()

    const menuSections = [
        {
            title: "OVERVIEW",
            items: [
                {
                    label: "Dashboard",
                    path: "/dashboard",
                    icon: LayoutDashboard,
                },
            ],
        },
        {
            title: "MANAGEMENT",
            items: [
                {
                    label: "Locations",
                    path: "/locations",
                    icon: Building2,
                },
                {
                    label: "Properties",
                    path: "/properties",
                    icon: House,
                },
                {
                    label: "Rooms",
                    path: "/rooms",
                    icon: BedDouble,
                },
                {
                    label: "Bookings",
                    path: "/bookings",
                    icon: CalendarDays,
                },
            ],
        },
        {
            title: "FINANCE",
            items: [
                {
                    label: "Payments",
                    path: "/payments",
                    icon: CreditCard,
                },
                {
                    label: "Pricing Management",
                    path: "/pricing-management",
                    icon: DollarSign,
                },
                {
                    label: "Coupon & Offers",
                    path: "/offers",
                    icon: Tag,
                },
            ],
        },
        {
            title: "PEOPLE",
            items: [
                {
                    label: "Users",
                    path: "/users",
                    icon: Users,
                },
                {
                    label: "Vendors",
                    path: "/vendors",
                    icon: Store,
                },
            ],
        },

        {
            title: "INSIGHTS",
            items: [
                {
                    label: "Reviews",
                    path: "/reviews",
                    icon: Star,
                },
                {
                    label: "Reports",
                    path: "/reports",
                    icon: BarChart3,
                },
            ],
        },
        {
            title: "SYSTEM",
            items: [
                {
                    label: "Roles & Permissions",
                    path: "/roles",
                    icon: Shield,
                },
                {
                    label: "Audit Logs",
                    path: "/audit-logs",
                    icon: ClipboardList,
                },
            ],
        },
    ];

    const handleLogout = () => {
        dispatch(logoutUser())
        navigate("/login");
    };

    const handleNavClick = () => {
        if (typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT) {
            setSidebarOpen(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0f172a] text-white border-r border-slate-800 transition-all duration-300
        ${sidebarOpen ? "w-70" : "w-20"}
        ${sidebarOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0"
                    } lg:relative`}
            >
                <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <img
                            src={sidebarOpen ? "/logo.png" : "/fav.png"}
                            alt="Logo"
                            className={sidebarOpen ? "h-7 object-contain" : "h-10 w-10 object-contain"} />

                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-400"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
                    {menuSections?.map((section) => (
                        <div key={section.title} className="mb-6">
                            {sidebarOpen && (
                                <h3 className="px-5 mb-2 text-[11px] font-semibold tracking-wider text-slate-500">
                                    {section.title}
                                </h3>
                            )}

                            <div className="space-y-1 px-3">
                                {section?.items?.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={handleNavClick}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                        ${isActive
                                                    ? "bg-blue-900/50 text-white"
                                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                                }`
                                            }
                                        >
                                            <Icon size={18} />

                                            {sidebarOpen && (
                                                <span className="font-medium">
                                                    {item.label}
                                                </span>
                                            )}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t border-slate-800 p-4">
                    <div className="flex items-center gap-3">
                        <CustomImage
                            src={
                                user?.avatar ||
                                "https://ui-avatars.com/api/?name=Admin"
                            }
                            alt={user?.name || "Admin"}
                            className="h-10 w-10 rounded-full object-cover"
                        />

                        {sidebarOpen && (
                            <>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium truncate">
                                        {user?.name || "Admin"}
                                    </p>

                                    <p className="text-xs text-slate-400 truncate">
                                        {user?.role || "Administrator"}
                                    </p>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <LogOut size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}