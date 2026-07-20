import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

interface DotMenuProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    className?: string;
}

const DotMenu: React.FC<DotMenuProps> = ({
    onView,
    onEdit,
    onDelete,
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

            const menuWidth = 130;
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className={`absolute w-32 border bg-white border-gray-200 rounded-md shadow-lg z-[9999] ${className}`}
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
                                        className="block w-full px-4 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        View
                                    </button>
                                )}

                                {onEdit && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit();
                                            setIsOpen(false);
                                        }}
                                        className="block w-full px-4 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                        Update
                                    </button>
                                )}

                                {onDelete && (
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            onDelete();
                                        }}
                                        className="block w-full px-4 py-1.5 text-left text-sm text-red-600 hover:bg-gray-100"
                                    >
                                        Delete
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