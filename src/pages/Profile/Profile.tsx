import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Briefcase,
    Key,
    Calendar,
    Clock,
    Shield,
    CheckCircle,
    Edit,
    Camera,
    MapPin,
    Globe,
    Users,
} from 'lucide-react';
import { useAppSelector } from '../../hooks/hooks';

interface StatusBadgeProps {
    status: 'Active' | 'Inactive' | 'Verified' | 'Pending';
    text?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'Active':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'Verified':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'Inactive':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'Pending':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusDot = () => {
        switch (status) {
            case 'Active':
                return <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />;
            case 'Verified':
                return <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />;
            case 'Inactive':
                return <span className="h-1.5 w-1.5 rounded-full bg-red-500" />;
            case 'Pending':
                return <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />;
            default:
                return null;
        }
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyles()}`}
        >
            {getStatusDot()}
            {text || status}
        </span>
    );
};

interface ProfileFieldProps {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
}

const ProfileField: React.FC<ProfileFieldProps> = ({ label, value, icon }) => {
    return (
        <div className="flex flex-col space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                {icon && <span className="text-slate-400">{icon}</span>}
                <span>{label}</span>
            </div>
            <div className="text-sm font-medium text-slate-800">{value}</div>
        </div>
    );
};

export default function AdminProfilePage() {
    const { user } = useAppSelector((state: any) => state.auth);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const userData = user || {
        name: 'Natashia Khaleira',
        email: 'info@binary-fusion.com',
        phone: '(+62) 821 2554-5846',
        role: 'Admin',
        location: 'Leeds, United Kingdom',
        isActive: true,
        isVerified: true,
        loginMethod: 'Password',
        created: 'July 02, 2026',
        lastLogin: 'July 13, 2026',
        userId: 'USR-8A7F-3D2E',
        adminRole: 'Admin',
        firstName: 'Natashia',
        lastName: 'Khaleira',
        country: 'United Kingdom',
        city: 'Leeds, East London',
        postalCode: 'ERT 1254',
    };

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans antialiased">
            <div className="mx-auto max-w-7xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                    <p className="text-sm text-slate-500">
                        Manage your account information and preferences
                    </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                            <div className="relative">
                                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200/80 bg-gradient-to-br from-indigo-500 to-indigo-600 text-lg font-semibold text-white">
                                    {avatarUrl ? (
                                        <img
                                            src={avatarUrl}
                                            alt={userData.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span>
                                            {userData.name
                                                .split(' ')
                                                .map((n: string) => n[0])
                                                .join('')}
                                        </span>
                                    )}
                                </div>
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-600 shadow-sm transition-colors hover:bg-slate-200"
                                >
                                    <Camera size={14} />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {userData.name}
                                </h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-200/60">
                                        <Shield size={12} />
                                        {userData.role}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-slate-500">
                                        <MapPin size={14} />
                                        {userData.location}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Mail size={14} />
                                    <span>{userData.email}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
                        <h3 className="text-base font-semibold text-slate-800">
                            Personal Information
                        </h3>
                        <button className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800">
                            <Edit size={14} />
                            Edit
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <ProfileField
                                label="First Name"
                                value={userData.firstName || userData.name.split(' ')[0]}
                                icon={<User size={14} />}
                            />
                            <ProfileField
                                label="Last Name"
                                value={userData.lastName || userData.name.split(' ').slice(1).join(' ')}
                                icon={<User size={14} />}
                            />
                            <ProfileField
                                label="Email Address"
                                value={userData.email}
                                icon={<Mail size={14} />}
                            />
                            <ProfileField
                                label="Phone Number"
                                value={userData.phone || 'Not Available'}
                                icon={<Phone size={14} />}
                            />
                            <ProfileField
                                label="User Role"
                                value={userData.role}
                                icon={<Briefcase size={14} />}
                            />
                            <ProfileField
                                label="Login Method"
                                value={userData.loginMethod || 'Password'}
                                icon={<Key size={14} />}
                            />
                            <ProfileField
                                label="Country"
                                value={userData.country || 'United Kingdom'}
                                icon={<Globe size={14} />}
                            />
                            <ProfileField
                                label="City"
                                value={userData.city || 'Leeds, East London'}
                                icon={<MapPin size={14} />}
                            />
                            <ProfileField
                                label="Postal Code"
                                value={userData.postalCode || 'ERT 1254'}
                                icon={<MapPin size={14} />}
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-md">
                    <div className="border-b border-slate-200/80 px-6 py-4">
                        <h3 className="text-base font-semibold text-slate-800">
                            Account Information
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <ProfileField
                                label="Account Status"
                                value={
                                    <StatusBadge status={userData.isActive ? 'Active' : 'Inactive'} />
                                }
                                icon={<Users size={14} />}
                            />
                            <ProfileField
                                label="Email Verification"
                                value={
                                    <StatusBadge status={userData.isVerified ? 'Verified' : 'Pending'} />
                                }
                                icon={<CheckCircle size={14} />}
                            />
                            <ProfileField
                                label="Created Date"
                                value={userData.created || 'July 02, 2026'}
                                icon={<Calendar size={14} />}
                            />
                            <ProfileField
                                label="Updated Date"
                                value={userData.lastLogin || 'July 13, 2026'}
                                icon={<Clock size={14} />}
                            />
                            <ProfileField
                                label="User ID"
                                value={
                                    <span className="font-mono text-xs text-slate-600">
                                        {userData.userId || 'USR-8A7F-3D2E'}
                                    </span>
                                }
                                icon={<Globe size={14} />}
                            />
                            <ProfileField
                                label="Admin Role"
                                value={
                                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200/60 bg-indigo-50/50 px-3 py-1 text-xs font-medium text-indigo-700">
                                        <Shield size={12} />
                                        {userData.adminRole || userData.role}
                                    </span>
                                }
                                icon={<Shield size={14} />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}