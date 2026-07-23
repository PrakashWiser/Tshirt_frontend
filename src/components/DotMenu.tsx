import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    LogIn,
    LogOut,
    CheckCircle,
    XCircle,
    PauseCircle,
    PlayCircle,
    KeyRound
} from "lucide-react";
import { useAppSelector } from "../hooks/hooks";

interface DotMenuProps {
    showEdit?: boolean;
    showDelete?: boolean;
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onCheckIn?: () => void;
    onCheckOut?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onSuspend?: () => void;
    onActivate?: () => void;
    onResetPassword?: () => void;

    className?: string;
}

const DotMenu: React.FC<DotMenuProps> = ({
    showDelete,
    showEdit,
    onView,
    onEdit,
    onDelete,
    onCheckIn,
    onCheckOut,
    onApprove,
    onReject,
    onSuspend,
    onActivate,
    onResetPassword,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const { user } = useAppSelector((state) => state.auth);
    const isSuperAdmin = user?.role === "superadmin";

    const [position, setPosition] = useState({
        top: 0,
        left: 0,
    });

    const toggleMenu = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();

            const menuWidth = 160;
            const screenWidth = window.innerWidth;

            let left =
                rect.left +
                window.scrollX -
                menuWidth / 2 +
                rect.width / 2;

            const top = rect.bottom + window.scrollY + 6;

            if (left < 8) left = 8;
            if (left + menuWidth > screenWidth) {
                left = screenWidth - menuWidth - 8;
            }

            setPosition({ top, left });
        }

        setIsOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                buttonRef.current?.contains(target) ||
                menuRef.current?.contains(target)
            ) {
                return;
            }

            setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
            <button
                ref={buttonRef}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleMenu();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 cursor-pointer"
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen &&
                createPortal(
                    <AnimatePresence>
                        <motion.div
                            ref={menuRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute w-40 border bg-white border-gray-200 rounded-md shadow-lg z-[9999] ${className}`}
                            style={{
                                top: position.top,
                                left: position.left,
                            }}
                        >
                            <div>
                                {onView && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onView();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <Eye size={16} />
                                        View
                                    </button>
                                )}

                                {(isSuperAdmin || showEdit) && onEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit();
                                            setIsOpen(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        <Pencil size={16} />
                                        Update
                                    </button>
                                )}
                                {(isSuperAdmin || showDelete) && onDelete && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onDelete();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                )}

                                {onCheckIn && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onCheckIn();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100"
                                    >
                                        <LogIn size={16} />
                                        Check In
                                    </button>
                                )}

                                {onCheckOut && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onCheckOut();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
                                    >
                                        <LogOut size={16} />
                                        Check Out
                                    </button>
                                )}

                                {onApprove && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onApprove();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100"
                                    >
                                        <CheckCircle size={16} />
                                        Approve
                                    </button>
                                )}

                                {onReject && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onReject();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        <XCircle size={16} />
                                        Reject
                                    </button>
                                )}

                                {onSuspend && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onSuspend();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-orange-600 hover:bg-gray-100"
                                    >
                                        <PauseCircle size={16} />
                                        Suspend
                                    </button>
                                )}

                                {onActivate && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onActivate();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-100"
                                    >
                                        <PlayCircle size={16} />
                                        Activate
                                    </button>
                                )}

                                {onResetPassword && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsOpen(false);
                                            onResetPassword();
                                        }}
                                        className="flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-blue-600 hover:bg-gray-100"
                                    >
                                        <KeyRound size={16} />
                                        Reset Password
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>,
                    document.body
                )}
        </>
    );
};

export default DotMenu;