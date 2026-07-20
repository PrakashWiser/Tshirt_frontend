import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast } from '../store/slice/uiSlice';

export default function ToastContainer() {
    const dispatch = useDispatch();
    const { toasts } = useSelector((state: any) => state.ui);

    return (
        <div
            id="toast-container"
            className="fixed bottom-5 right-5 z-55 flex flex-col gap-3 min-w-[280px] max-w-[360px]"
        >
            <AnimatePresence>
                {toasts?.map((toast: any) => (
                    <ToastCard key={toast.id} id={toast.id} type={toast.type} text={toast.text} onClose={(id) => dispatch(removeToast(id))} />
                ))}
            </AnimatePresence>
        </div>
    );
}

interface ToastCardProps {
    key?: string;
    id: string;
    type: 'success' | 'error' | 'info';
    text: string;
    onClose: (id: string) => void;
}

function ToastCard({ id, type, text, onClose }: ToastCardProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 3000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    const config = {
        success: {
            bg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
            text: 'text-emerald-800 dark:text-emerald-200',
            icon: CheckCircle,
            iconColor: 'text-emerald-500',
        },
        error: {
            bg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800',
            text: 'text-rose-800 dark:text-rose-200',
            icon: AlertCircle,
            iconColor: 'text-rose-500',
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
            text: 'text-blue-800 dark:text-blue-200',
            icon: Info,
            iconColor: 'text-blue-500',
        },
    };

    const { bg, text: textColor, icon: Icon, iconColor } = config[type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`p-4 rounded-xl border flex items-start gap-3 shadow-lg backdrop-blur-md ${bg}`}
            id={`toast-message-${id}`}
        >
            <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold leading-relaxed ${textColor}`}>
                    {text}
                </p>
            </div>
            <button
                onClick={() => onClose(id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Dismiss Alert"
                id={`close-toast-${id}`}
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
