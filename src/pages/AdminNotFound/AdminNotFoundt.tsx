import { Link } from "react-router-dom";
import { AlertTriangle, Home } from "lucide-react";

const AdminNotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
            <div className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                </div>
                <h1 className="text-7xl font-bold text-gray-900">404</h1>
                <h2 className="mt-4 text-2xl font-semibold text-gray-800">
                    Page Not Found
                </h2>
                <p className="mt-3 text-gray-500">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <div className="mt-8">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                    >
                        <Home size={18} />
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminNotFound;