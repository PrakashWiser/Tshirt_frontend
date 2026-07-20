import { useEffect, useState } from 'react';
import {
    Users,
    Plus,
    Edit2,
    Trash2,
    Shield,
    Building2,
    CreditCard,
    Headphones,
    MoreVertical,
    Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { setBreadcrumbs } from '../../store/slice/uiSlice';
import { useAppDispatch } from '../../hooks/hooks';
import Button from '../../components/Button';
import Permissions from './Permissions';

const DUMMY_ROLES = [
    {
        id: 1,
        name: 'Super Admin',
        description: 'Full system access',
        userCount: 2,
        icon: Shield,
        color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/30'
    },
    {
        id: 2,
        name: 'Platform Admin',
        description: 'Manage all properties and users',
        userCount: 5,
        icon: Building2,
        color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/30'
    },
    {
        id: 3,
        name: 'Finance Manager',
        description: 'Payments, refunds, reports',
        userCount: 8,
        icon: CreditCard,
        color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'
    },
    {
        id: 4,
        name: 'Property Manager',
        description: 'Manage assigned properties',
        userCount: 2,
        icon: Building2,
        color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30'
    },
    {
        id: 5,
        name: 'Support Agent',
        description: 'View bookings, resolve tickets',
        userCount: 32,
        icon: Headphones,
        color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/30'
    }
];

export default function Roles() {
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        dispatch(setBreadcrumbs([
            { label: 'System', path: '/system' },
            { label: 'Roles' }
        ]));
    }, [dispatch]);

    const filteredRoles = DUMMY_ROLES.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (open) {
        return <Permissions
            onCancel={() => setOpen(false)}
            onSave={(roleName, description, permissions) => {
                console.log({ roleName, description, permissions });
                setOpen(false);
            }}
        />;
    }

    return (
        <div className="space-y-6" id="roles-page">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Roles
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        System - Roles & Permissions
                    </p>
                </div>
                <Button
                    onClick={() => setOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-md text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" />
                    New Role
                </Button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles?.map((role) => {
                    const Icon = role.icon;
                    return (
                        <div
                            key={role.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${role.color}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            {role.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            {role.description}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Users className="w-4 h-4" />
                                    <span>{role.userCount} users</span>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/system/roles/${role.id}/permissions`}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <Shield className="w-4 h-4" />
                                    </Link>
                                    <button className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}