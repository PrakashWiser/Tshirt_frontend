import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
    MoreHorizontal,
    CheckCircle,
    Clock3,
    XCircle,
} from "lucide-react";

export type VerificationStatus = "Verified" | "Pending" | "Rejected";

interface DotMenuProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onVerificationChange?: (status: VerificationStatus) => void;
    verificationStatus?: VerificationStatus;
    className?: string;
}

const DotMenu: React.FC<DotMenuProps> = ({
    onView,
    onEdit,
    onDelete,
    onVerificationChange,
    verificationStatus = "Pending",
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

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

            setPosition({
                top,
                left,
            });
        }

        setIsOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                !buttonRef.current?.contains(target) &&
                !menuRef.current?.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleVerification = (status: VerificationStatus) => {
        setIsOpen(false);
        onVerificationChange?.(status);
    };

    const getVerificationClass = (status: VerificationStatus) => {
        if (verificationStatus === status) {
            if (status === "Verified") {
                return "bg-green-50 text-green-700";
            }

            if (status === "Rejected") {
                return "bg-red-50 text-red-700";
            }

            return "bg-amber-50 text-amber-700";
        }

        return "text-gray-700 hover:bg-gray-50";
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 cursor-pointer"
            >
                <MoreHorizontal size={16} />
            </button>

            {isOpen &&
                createPortal(
                    <AnimatePresence>
                        <motion.div
                            ref={menuRef}
                            initial={{
                                opacity: 0,
                                scale: 0.95,
                                y: -4,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0.95,
                                y: -4,
                            }}
                            transition={{ duration: 0.15 }}
                            className={`absolute w-40 border bg-white border-gray-200 rounded-lg shadow-xl z-[9999] overflow-hidden ${className || ""}`}
                            style={{
                                top: position.top,
                                left: position.left,
                            }}
                        >
                            <div>
                                {onView && (
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            onView();
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        View
                                    </button>
                                )}

                                {onEdit && (
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            onEdit();
                                        }}
                                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        Update
                                    </button>
                                )}

                                {onDelete && (
                                    <>
                                        <div />
                                        <button
                                            onClick={() => {
                                                setIsOpen(false);
                                                onDelete();
                                            }}
                                            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}

                                {onVerificationChange && (
                                    <>
                                        <div />
                                        <button
                                            onClick={() =>
                                                handleVerification("Verified")
                                            }
                                            disabled={
                                                verificationStatus ===
                                                "Verified"
                                            }
                                            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${getVerificationClass(
                                                "Verified",
                                            )}`}
                                        >
                                            <CheckCircle
                                                size={15}
                                                className="text-green-600"
                                            />
                                            <span>Verified</span>

                                            {verificationStatus ===
                                                "Verified" && (
                                                    <span className="ml-auto text-xs font-medium">
                                                        Current
                                                    </span>
                                                )}
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleVerification("Pending")
                                            }
                                            disabled={
                                                verificationStatus ===
                                                "Pending"
                                            }
                                            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${getVerificationClass(
                                                "Pending",
                                            )}`}
                                        >
                                            <Clock3
                                                size={15}
                                                className="text-amber-600"
                                            />
                                            <span>Pending</span>

                                            {verificationStatus ===
                                                "Pending" && (
                                                    <span className="ml-auto text-xs font-medium">
                                                        Current
                                                    </span>
                                                )}
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleVerification("Rejected")
                                            }
                                            disabled={
                                                verificationStatus ===
                                                "Rejected"
                                            }
                                            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${getVerificationClass(
                                                "Rejected",
                                            )}`}
                                        >
                                            <XCircle
                                                size={15}
                                                className="text-red-600"
                                            />
                                            <span>Rejected</span>

                                            {verificationStatus ===
                                                "Rejected" && (
                                                    <span className="ml-auto text-xs font-medium">
                                                        Current
                                                    </span>
                                                )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>,
                    document.body,
                )}
        </>
    );
};

export default DotMenu;