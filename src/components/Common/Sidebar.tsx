import {
  LayoutDashboard,
  Users,
  LogOut,
  X,
  MessageSquareText,
  Headphones,
  Package,
  FolderTree,
  Image,
  TicketPercent,
  ClipboardList,
  Shield,
  CreditCard,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { SidebarProps } from "../../types";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import CustomImage from "../Image";
import { clearAuth } from "../../store/slice/authSlice";
import { useState } from "react";

const MOBILE_BREAKPOINT = 1024;

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

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
          label: "Banners",
          path: "/banners",
          icon: Image,
        },
        {
          label: "Categories",
          path: "/categories",
          icon: FolderTree,
        },

        {
          label: "Products",
          path: "/products",
          icon: Package,
        },

        {
          label: "Coupons",
          path: "/offers",
          icon: TicketPercent,
        },
        {
          label: "Payments",
          path: "/payments",
          icon: CreditCard,
        },
      ],
    },
    {
      title: "PEOPLE",
      items: [
        {
          label: "Enquiries",
          path: "/enquiries",
          icon: MessageSquareText,
        },
        {
          label: "Users",
          path: "/users",
          icon: Users,
        },
        {
          label: "Contact",
          path: "/contact",
          icon: Headphones,
        },
        {
          label: "Profile",
          path: "/profile",
          icon: Shield,
        },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        {
          label: "Audit Logs",
          path: "/audit-logs",
          icon: ClipboardList,
        },
        {
          label: "Roles & Permissions",
          path: "/roles",
          icon: Shield,
        },
      ],
    },
  ];

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/login");
  };

  const handleNavClick = () => {
    if (
      typeof window !== "undefined" &&
      window.innerWidth < MOBILE_BREAKPOINT
    ) {
      setSidebarOpen(false);
    }
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLAnchorElement>,
    label: string,
  ) => {
    if (!sidebarOpen) {
      const rect = e.currentTarget.getBoundingClientRect();

      setTooltipPosition({
        x: rect.right + 12,
        y: rect.top + rect.height / 2,
      });

      setHoveredItem(label);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
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

      <AnimatePresence>
        {!sidebarOpen && hoveredItem && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
              x: -10,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              x: -10,
            }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              transform: "translateY(-50%)",
              zIndex: 9999,
            }}
            className="bg-slate-800 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-lg border border-slate-700 whitespace-nowrap pointer-events-none"
          >
            {hoveredItem}

            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
          </motion.div>
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#0f172a] text-white border-r border-slate-800 transition-all duration-300
                ${sidebarOpen ? "w-70" : "w-20"}
                ${
                  sidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full lg:translate-x-0"
                } lg:relative`}
      >
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-5 overflow-hidden">
            <motion.img
              src="/logo.png"
              alt="Tshirt Admin"
              className={
                sidebarOpen
                  ? "h-10 w-10 rounded-full object-contain"
                  : "h-7 w-7 rounded-full object-contain"
              }
            />

            {sidebarOpen && (
              <div className="flex flex-col">
                <motion.span
                  className="text-xl font-bold tracking-tight"
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                >
                  Tshirt Admin
                </motion.span>
              </div>
            )}
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              {sidebarOpen && (
                <h3 className="px-5 mb-2 text-[11px] font-semibold tracking-wider text-slate-500">
                  {section.title}
                </h3>
              )}

              <div className="space-y-1 px-3">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                      onMouseLeave={handleMouseLeave}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all relative
                                                ${
                                                  isActive
                                                    ? "bg-[#3A29AA] text-white shadow-sm ring-1 ring-[#3A29AA]/40"
                                                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                                }
                                                ${
                                                  !sidebarOpen
                                                    ? "justify-center"
                                                    : ""
                                                }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={18}
                            strokeWidth={1.8}
                            className={
                              isActive ? "text-white" : "text-slate-300"
                            }
                          />

                          {sidebarOpen && (
                            <span className="font-medium">{item.label}</span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 p-4">
          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <CustomImage
              src={
                user?.profilePhoto || "https://ui-avatars.com/api/?name=Admin"
              }
              alt={user?.name || "Admin"}
              className="h-10 w-10 rounded-full object-cover shrink-0"
            />

            {sidebarOpen && (
              <>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.name || "Admin"}
                  </p>

                  <p className="text-xs text-white capitalize truncate">
                    {user?.role || "Administrator"}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-[#3A29AA] shrink-0"
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
