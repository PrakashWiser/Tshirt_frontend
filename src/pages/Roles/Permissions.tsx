import { useState } from "react";
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    Circle,
    Save,
    X,
    Home,
    Building2,
    Calendar,
    Users,
    CreditCard,
    FileText,
    UserCog,
    AlertCircle,
} from "lucide-react";

interface createRoleProps {
    onCancel: () => void;
    onSave: (roleName: string, description: string, permissions: any) => void;
}

export default function CreateRole({ onCancel, onSave }: createRoleProps) {
    const [roleName, setRoleName] = useState("");
    const [description, setDescription] = useState("");

    const [permissions, setPermissions] = useState({
        dashboard: { view: false, edit: false, delete: false },
        properties: { view: false, edit: false, delete: false },
        bookings: { view: false, edit: false, delete: false },
        users: { view: false, edit: false, delete: false },
        vendors: { view: false, edit: false, delete: false },
        payments: { view: false, edit: false, delete: false },
        reports: { view: false, edit: false, delete: false },
        roles: { view: false, edit: false, delete: false },
        audit: { view: false, edit: false, delete: false },
    });

    const MODULE_LABELS = {
        dashboard: "Dashboard",
        properties: "Properties",
        bookings: "Bookings",
        users: "Users",
        vendors: "Vendors",
        payments: "Payments",
        reports: "Reports",
        roles: "Roles",
        audit: "Audit",
    };

    const MODULE_ICONS = {
        dashboard: Home,
        properties: Building2,
        bookings: Calendar,
        users: Users,
        vendors: Building2,
        payments: CreditCard,
        reports: FileText,
        roles: UserCog,
        audit: AlertCircle,
    };

    const togglePermission = (
        module: string,
        action: "view" | "edit" | "delete"
    ) => {
        setPermissions((prev) => ({
            ...prev,
            [module]: {
                ...prev[module as keyof typeof prev],
                [action]:
                    !prev[module as keyof typeof prev][
                    action as keyof (typeof prev)[keyof typeof prev]
                    ],
            },
        }));
    };

    const handleSave = () => {
        onSave(roleName, description, permissions);
    };

    return (
        <div className=" space-y-6 ">
            <div className="flex flex-col md:flex-row justify-between md:items-start">
                <div>
                    <Link
                        to="/roles"
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-1"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Roles
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Create Role</h1>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-white cur-po border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-black cursor-pointer text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                        <Save className="w-4 h-4" />
                        Create Role
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Role Details</h3>
                <div className="grid md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Role Name
                        </label>
                        <input
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="e.g. Operations Manager"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Description
                        </label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of this role"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">Permission Matrix</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Module
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    View
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Edit
                                </th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Delete
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(MODULE_LABELS).map((module, index) => {
                                const Icon = MODULE_ICONS[module as keyof typeof MODULE_ICONS];
                                const isEven = index % 2 === 0;

                                return (
                                    <tr
                                        key={module}
                                        className={`border-b border-gray-100 ${isEven ? 'bg-white' : 'bg-gray-50/50'}`}
                                    >
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <Icon className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">
                                                    {MODULE_LABELS[module as keyof typeof MODULE_LABELS]}
                                                </span>
                                            </div>
                                        </td>
                                        {["view", "edit", "delete"].map((action) => (
                                            <td key={action} className="text-center px-4 py-3.5">
                                                <button
                                                    onClick={() =>
                                                        togglePermission(
                                                            module,
                                                            action as "view" | "edit" | "delete"
                                                        )
                                                    }
                                                    className="focus:outline-none"
                                                >
                                                    {permissions[module as keyof typeof permissions][
                                                        action as keyof (typeof permissions)[keyof typeof permissions]
                                                    ] ? (
                                                        <CheckCircle className="text-green-500 w-5 h-5 mx-auto" />
                                                    ) : (
                                                        <Circle className="text-gray-300 w-5 h-5 mx-auto hover:text-gray-400 transition-colors" />
                                                    )}
                                                </button>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>●</span>
                <span>Full system access — Super Admin</span>
            </div>
        </div>
    );
}