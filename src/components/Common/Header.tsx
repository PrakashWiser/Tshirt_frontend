import {
    Menu,
    Search,
    User,
    LogOut,
    Bell,
    X,
} from "lucide-react";
import {
    useLocation,
    useNavigate,
} from "react-router-dom";
import {
    useState,
    useRef,
    useEffect,
    useCallback,
} from "react";
import {
    useAppDispatch,
    useAppSelector,
} from "../../hooks/hooks";
import CustomImage from "../Image";
import { logoutUser } from "../../store/slice/authSlice";
import useAdminNotifications from "../../hooks/useAdminNotifications";
import { getAllProperties, type Property } from "../../store/slice/propertySlice";

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
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Property[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const profileRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

            if (searchRef.current && !searchRef.current.contains(target)) {
                setShowDropdown(false);
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

    const performSearch = useCallback(async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowDropdown(false);
            return;
        }

        setIsSearching(true);
        try {
            const result = await dispatch(
                getAllProperties({
                    page: 1,
                    limit: 10,
                    filters: { search: query }
                })
            ).unwrap();

            if (result?.properties) {
                setSearchResults(result.properties);
                setShowDropdown(true);
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [dispatch]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            performSearch(value);
        }, 500);
    };

    const handleSearchClear = () => {
        setSearchQuery("");
        setSearchResults([]);
        setShowDropdown(false);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
    };

    const handlePropertySelect = (propertyId: string) => {
        setShowDropdown(false);
        setSearchQuery("");
        setSearchResults([]);
        navigate(`/properties/${propertyId}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchResults.length > 0) {
            handlePropertySelect(searchResults[0].id);
        }
        if (e.key === "Escape") {
            handleSearchClear();
        }
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
                <div className="relative hidden md:block" ref={searchRef}>
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search properties..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                                if (searchResults.length > 0) {
                                    setShowDropdown(true);
                                }
                            }}
                            className="w-72 pl-10 pr-10 py-1.5 border border-gray-300 rounded-lg focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={handleSearchClear}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {showDropdown && (
                        <div className="absolute top-full left-0 mt-2 w-72 max-h-96 overflow-y-auto bg-white rounded-xl shadow-xl border border-gray-200 z-50">
                            {isSearching ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : searchResults.length > 0 ? (
                                <>
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <span className="text-xs font-medium text-gray-500">
                                            {searchResults.length} results found
                                        </span>
                                    </div>
                                    {searchResults.map((property) => (
                                        <button
                                            key={property.id}
                                            onClick={() => handlePropertySelect(property.id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
                                        >
                                            <CustomImage
                                                src={property.image || ""}
                                                alt={property.name}
                                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {property.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-gray-500">
                                                        {typeof property.propertyType === "object"
                                                            ? property.propertyType?.name
                                                            : property.propertyType}
                                                    </span>
                                                    <span className="text-xs text-gray-300">•</span>
                                                    <span className="text-xs text-gray-500">
                                                        {property.bhk} BHK
                                                    </span>
                                                    <span className="text-xs text-gray-300">•</span>
                                                    <span className="text-xs font-medium text-emerald-600">
                                                        {property.price}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 truncate mt-0.5">
                                                    {typeof property.location === "object"
                                                        ? `${property.location?.locality || ""}, ${property.location?.city || ""}`
                                                        : property.location}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                    <div className="px-4 py-2 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">
                                            Press Enter to view first result
                                        </span>
                                    </div>
                                </>
                            ) : searchQuery.trim() ? (
                                <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                        <Search size={20} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">
                                        No properties found
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Try adjusting your search terms
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    )}
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
                        <div className="absolute right-0 top-full mt-3 w-[400px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl z-50">
                            <div className="flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-base font-semibold text-gray-900">
                                            Notifications
                                        </h4>

                                        {unreadCount > 0 && (
                                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                                                {unreadCount} new
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-0.5 text-xs text-gray-400 capitalize">
                                        Stay updated with your latest activity
                                    </p>
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleMarkAllAsRead}
                                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                                    >
                                        Mark all read
                                    </button>
                                )}
                            </div>

                            <div className="max-h-[420px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                            <svg
                                                className="h-6 w-6 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.8}
                                                    d="M15 17h5l-1.5-1.5A2 2 0 0118 14V10a6 6 0 00-12 0v4a2 2 0 01-.5 1.5L4 17h5m6 0a3 3 0 01-6 0m6 0H9"
                                                />
                                            </svg>
                                        </div>

                                        <h5 className="text-sm font-semibold text-gray-800">
                                            No notifications
                                        </h5>

                                        <p className="mt-1 max-w-[240px] text-xs leading-5 text-gray-400">
                                            You're all caught up. New notifications will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    notifications.map((notification) => (
                                        <button
                                            type="button"
                                            key={notification.id}
                                            onClick={() =>
                                                handleMarkAsRead(notification.id)
                                            }
                                            className={`group relative flex w-full gap-3 border-b border-gray-100 px-5 py-4 text-left transition-all duration-200 last:border-b-0
                            ${notification.read
                                                    ? "bg-white hover:bg-gray-50"
                                                    : "bg-blue-50/60 hover:bg-blue-50"
                                                }
                        `}
                                        >
                                            <div className="flex-shrink-0 pt-0.5">
                                                <div
                                                    className={`flex h-9 w-9 items-center justify-center rounded-full
                                    ${notification.read
                                                            ? "bg-gray-100 text-gray-400"
                                                            : "bg-blue-100 text-blue-600"
                                                        }
                                `}
                                                >
                                                    <svg
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1.8}
                                                            d="M15 17h5l-1.5-1.5A2 2 0 0118 14V10a6 6 0 00-12 0v4a2 2 0 01-.5 1.5L4 17h5m6 0a3 3 0 01-6 0"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p
                                                        className={`line-clamp-2 text-sm leading-5
                                        ${notification.read
                                                                ? "font-medium text-gray-700"
                                                                : "font-semibold text-gray-900"
                                                            }
                                    `}
                                                    >
                                                        {notification.message}
                                                    </p>

                                                    {!notification.read && (
                                                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                                                    )}
                                                </div>
                                                <div className="mt-2 space-y-1.5">
                                                    {notification.data?.fullName && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span className="font-medium text-gray-600">
                                                                Customer:
                                                            </span>
                                                            <span className="truncate">
                                                                {notification.data.fullName}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {notification.data?.phone && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span className="font-medium text-gray-600">
                                                                Phone:
                                                            </span>
                                                            <span>
                                                                {notification.data.phone}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {notification.data?.propertyId?.name && (
                                                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                            <span className="font-medium text-gray-600">
                                                                Property:
                                                            </span>
                                                            <span className="truncate">
                                                                {notification.data.propertyId.name}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {notification.data?.specialRequest && (
                                                        <div className="rounded-lg bg-gray-50 px-2.5 py-2 text-xs leading-4 text-gray-500">
                                                            <span className="font-medium text-gray-600">
                                                                Request:
                                                            </span>{" "}
                                                            {notification.data.specialRequest}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="mt-2.5 text-[10px] font-medium text-gray-400">
                                                    {notification.timestamp
                                                        ? new Date(
                                                            notification.timestamp
                                                        ).toLocaleString()
                                                        : ""}
                                                </p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-3 text-center">
                                    <button
                                        type="button"
                                        className="text-xs font-medium text-gray-500 transition hover:text-blue-600"
                                    >
                                        View all notifications
                                    </button>
                                </div>
                            )}
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
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition cursor-pointer"
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