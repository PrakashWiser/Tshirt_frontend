import {
    Menu,
    Search,
    User,
    LogOut,
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
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import CustomImage from "../Image";
import { logoutUser } from "../../store/slice/authSlice";

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
    const dispatch = useAppDispatch()
    const { user } = useAppSelector(
        (state: any) => state.auth
    );

    const [profileOpen, setProfileOpen] =
        useState(false);

    const profileRef =
        useRef<HTMLDivElement>(null);

    const pageTitle = location.pathname
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/-/g, " ")
        ?.replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target as Node
                )
            ) {
                setProfileOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const handleLogout = () => {
        dispatch(logoutUser())
        navigate("/login");
    };

    return (
        <header className="h-20 bg-white flex items-center border-b border-gray-100 justify-between px-6">
            <div className="flex items-center gap-4">
                <button
                    title={sidebarOpen ? "Close" : "Open"}
                    onClick={() =>
                        setSidebarOpen(!sidebarOpen)
                    }
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <Menu
                        size={22} />
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
                    title="Profile"
                    ref={profileRef}

                >
                    <button
                        onClick={() =>
                            setProfileOpen(!profileOpen)
                        }
                        className="rounded-full overflow-hidden cursor-pointer"
                    >
                        <CustomImage
                            src={
                                user?.avatar ||
                                `https://ui-avatars.com/api/?name=${user?.name || "Admin"
                                }`
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
                                            user?.avatar ||
                                            `https://ui-avatars.com/api/?name=${user?.name || "Admin"
                                            }`
                                        }
                                        alt={user?.name || "Admin"}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />

                                    <div>
                                        <h4 className="font-semibold text-gray-900">
                                            {user?.name || "Admin"}
                                        </h4>

                                        <p className="text-sm text-gray-500">
                                            {user?.email ||
                                                "admin@gmail.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() =>
                                    navigate("/profile")
                                }
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                            >
                                <User size={18} />
                                <span>My Profile</span>
                            </button>

                            <button
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