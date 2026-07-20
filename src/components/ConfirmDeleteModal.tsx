import React from "react";
import { motion, AnimatePresence, type Variants, } from "framer-motion";
import Button from "./Button";

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    title?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
}

const backdropVariants: Variants = {
    hidden: {
        opacity: 0,
    },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.2,
        },
    },
};

const modalVariants: Variants = {
    hidden: {
        y: "-100vh",
        opacity: 0,
    },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 120,
            damping: 15,
        },
    },
    exit: {
        y: "100vh",
        opacity: 0,
        transition: {
            duration: 0.3,
        },
    },
};

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    isOpen,
    title = "Are you sure?",
    onConfirm,
    onCancel,
    loading = false,
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onCancel}
                >
                    <motion.div
                        className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-xl"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">
                            {title}
                        </h3>

                        <div className="flex justify-center gap-3">
                            <Button
                                onClick={onConfirm}
                                disabled={loading}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                {loading ? "Deleting..." : "Delete"}
                            </Button>

                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={loading}
                                className="rounded-md border border-gray-300 px-4 py-2 text-gray-600 transition hover:bg-gray-50 cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDeleteModal;