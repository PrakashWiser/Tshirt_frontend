import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const Breadcrumbs = () => {
    const location = useLocation();

    const currentPage = location.pathname
        .split("/")
        .filter(Boolean)
        .pop();

    if (!currentPage || currentPage === "dashboard") {
        return null;
    }

    return (
        <div className="flex items-center gap-1 text-sm pb-4">
            <Link
                to="/dashboard"
                className="font-medium text-gray-500 hover:text-primary"
            >
                Dashboard
            </Link>

            <ChevronRight
                size={16}
                className="text-gray-400"
            />

            <span className="font-semibold text-gray-900">
                {currentPage
                    .replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
        </div>
    );
};

export default Breadcrumbs;