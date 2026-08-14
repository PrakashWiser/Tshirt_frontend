import {
    Menu,
    Search,
    User,
    LogOut,
    Bell,
} from "lucide-react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    useState,
    useRef,
    useEffect,
} from "react";
import {
    useAppDispatch,
    useAppSelector,
} from "../../hooks/hooks";
import CustomImage from "../Image";
import { logoutUser } from "../../store/slice/authSlice";
import useAdminNotifications from "../../hooks/useAdminNotifications";

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (value: boolean) => void;
}

function Header({
    sidebarOpen,
    setSidebarOpen,
}: HeaderProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllRead,
    } = useAdminNotifications();

    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    const pageTitle = location.pathname
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, " ")
        ?.replace(/\b\w/g, (char) => char.toUpperCase());

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (profileRef.current && !profileRef.current.contains(target)) {
                setProfileOpen(false);
            }

            if (notificationRef.current && !notificationRef.current.contains(target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        dispatch(logoutUser());
        navigate("/login");
    };

    const handleMarkAsRead = (id?: string) => {
        if (!id) return;
        markAsRead(id);
    };

    const handleMarkAllAsRead = () => {
        markAllRead();
    };

    const handleNotificationToggle = () => {
        setNotificationsOpen((prev) => !prev);
    };

    return (
        <header className="h-20 bg-white flex items-center border-b border-gray-100 justify-between px-6">
            <div className="flex items-center gap-4">
                <button
                    type="button"
                    title={sidebarOpen ? "Close" : "Open"}
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <Menu size={22} />
                </button>

                <h1 className="text-2xl font-bold text-gray-900">
                    {pageTitle || "Dashboard"}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-72 pl-10 pr-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div
                    className="relative"
                    title="Notifications"
                    ref={notificationRef}
                >
                    <button
                        type="button"
                        onClick={handleNotificationToggle}
                        className="relative p-2 rounded-full bg-gray-100 transition cursor-pointer hover:bg-gray-200"
                    >
                        <Bell size={20} />

                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-[20px] px-1 rounded-full bg-[#3A29AA] text-white text-[10px] font-semibold leading-none">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {notificationsOpen && (
                        <div className="absolute right-0 top-full mt-3 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <h4 className="font-semibold text-gray-900">
                                    Notifications
                                </h4>

                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-8 text-center text-sm text-gray-400">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <button
                                            type="button"
                                            key={notification.id}
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            className={`w-full text-left px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition flex gap-3 ${notification.read ? "bg-white" : "bg-blue-50/40"
                                                }`}
                                        >
                                            {!notification.read && (
                                                <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0 capitalize">
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {notification.message}
                                                </p>
                                                <div className="mt-1 space-y-1">
                                                    {notification.data?.fullName && (
                                                        <p className="text-xs text-gray-500">
                                                            <span className="font-medium">Customer:</span>{" "}
                                                            {notification.data.fullName}
                                                        </p>
                                                    )}

                                                    {notification.data?.phone && (
                                                        <p className="text-xs text-gray-500">
                                                            <span className="font-medium">Phone:</span>{" "}
                                                            {notification.data.phone}
                                                        </p>
                                                    )}

                                                    {notification.data?.propertyId && (
                                                        <p className="text-xs text-gray-500">
                                                            <span className="font-medium">Property:</span>{" "}
                                                            {notification.data.propertyId?.name}
                                                        </p>
                                                    )}

                                                    {notification.data?.specialRequest && (
                                                        <p className="text-xs text-gray-500">
                                                            <span className="font-medium">Request:</span>{" "}
                                                            {notification.data.specialRequest}
                                                        </p>
                                                    )}
                                                </div>

                                                <p className="text-[11px] text-gray-400 mt-2">
                                                    {notification.timestamp
                                                        ? new Date(notification.timestamp).toLocaleString()
                                                        : ""}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div
                    className="relative"
                    title="Profile"
                    ref={profileRef}
                >
                    <button
                        type="button"
                        onClick={() => setProfileOpen(!profileOpen)}
                        className="rounded-full overflow-hidden cursor-pointer"
                    >
                        <CustomImage
                            src={
                                user?.profilePhoto ||
                                `https://ui-avatars.com/api/?name=${user?.name || "Admin"}`
                            }
                            alt={user?.name || "Admin"}
                            className="w-10 h-10 rounded-full object-cover border border-gray-300"
                        />
                    </button>

                    {profileOpen && (
                        <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                            <div className="p-4">
                                <div className="flex items-center gap-3">
                                    <CustomImage
                                        src={
                                            user?.profilePhoto ||
                                            `https://ui-avatars.com/api/?name=${user?.name || "Admin"}`
                                        }
                                        alt={user?.name || "Admin"}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />

                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {user?.name || "Admin"}
                                        </h4>

                                        <p className="text-sm text-gray-500">
                                            {user?.email || "admin@gmail.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate("/profile")}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                            >
                                <User size={18} />
                                <span>My Profile</span>
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;