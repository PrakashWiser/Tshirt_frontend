import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Briefcase,
    Calendar,
    Clock,
    Shield,
    Edit,
    Camera,
    Globe,
    Users,
    X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { updateProfilePhoto, updateProfile } from '../../store/slice/authSlice';
import CustomImage from '../../components/Image';

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

interface EditProfileModalProps {
    isOpen: boolean;
    user: UserData | null;
    isLoading: boolean;
    onClose: () => void;
    onSave: (data: { firstName: string; lastName: string; email: string }) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
    isOpen,
    user,
    isLoading,
    onClose,
    onSave,
}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
            });
            setError(null);
        }
    }, [user, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            setError('All fields are required');
            return;
        }

        try {
            await onSave(formData);
        } catch (err: any) {
            setError(err?.message || 'Failed to update profile');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-800">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            First Name
                        </label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder="Enter first name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Last Name
                        </label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder="Enter last name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500"
                            placeholder="Enter email address"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface UserData {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    type: number;
    status: number;
    createdAt: string;
    updatedAt: string;
    profilePhoto?: string;
}

export default function AdminProfilePage() {
    const dispatch = useAppDispatch();
    const { user, updateProfilePhotoLoading, updateProfileLoading } = useAppSelector((state: any) => state.auth);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const userData: UserData = user || {
        _id: '6a7409efb1ff97f6f2cc98ce',
        firstName: 'Sri Vignesh RB superadmin',
        lastName: 'updated',
        email: 'srivigneshrbsuperadmin@gmail.com',
        type: 1,
        status: 1,
        createdAt: '2026-08-06T04:13:35.065Z',
        updatedAt: '2026-08-08T08:55:39.531Z',
        profilePhoto: '/storage/profile/logo-cbf8e4acb444f298.png'
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not Available';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatus = (status: number): 'Active' | 'Inactive' | 'Verified' | 'Pending' => {
        switch (status) {
            case 1:
                return 'Active';
            case 0:
                return 'Inactive';
            default:
                return 'Pending';
        }
    };

    const getUserRole = (type: number): string => {
        switch (type) {
            case 1:
                return 'Super Admin';
            case 2:
                return 'Admin';
            case 3:
                return 'User';
            default:
                return 'User';
        }
    };

    const getUserInitials = () => {
        if (userData.firstName && userData.lastName) {
            return `${userData.firstName[0]}${userData.lastName[0]}`;
        }
        return userData.email[0].toUpperCase();
    };

    const getFullName = () => {
        return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User';
    };

    const handleAvatarChange = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
        const formData = new FormData();
        formData.append('profilePhoto', file);

        try {
            await dispatch(updateProfilePhoto(formData))
        } catch (error) {
            console.error('Profile photo update failed:', error);
            setAvatarUrl(null);
        }
    };

    const handleEditProfile = async (data: {
        firstName: string;
        lastName: string;
        email: string;
    }) => {
        try {
            const combinedName = `${data.firstName} ${data.lastName}`.trim();
            const result = await dispatch(updateProfile({ name: combinedName, email: data.email }));
            if (result.meta.requestStatus === 'fulfilled') {
                setIsEditModalOpen(false);
            }
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    };

    const profilePhotoUrl = avatarUrl || userData.profilePhoto || null;

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
                                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-slate-200/80 bg-gradient-to-br from-indigo-500 to-indigo-600 text-lg font-semibold text-white">
                                    {profilePhotoUrl ? (
                                        <CustomImage
                                            src={profilePhotoUrl}
                                            alt={getFullName()}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span>{getUserInitials()}</span>
                                    )}

                                    {updateProfilePhotoLoading && (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        </div>
                                    )}
                                </div>

                                <label
                                    htmlFor="avatar-upload"
                                    className={`absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-600 shadow-sm ${updateProfilePhotoLoading
                                            ? "pointer-events-none opacity-50"
                                            : "cursor-pointer hover:bg-slate-200"
                                        }`}
                                >
                                    <Camera size={14} />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={updateProfilePhotoLoading}
                                        onChange={handleAvatarChange}
                                    />
                                </label>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {getFullName()}
                                </h2>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-200/60">
                                        <Shield size={12} />
                                        {getUserRole(userData.type)}
                                    </span>
                                    <span className="flex items-center gap-1 text-sm text-slate-500">
                                        <Mail size={14} />
                                        {userData.email}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                    <Calendar size={14} />
                                    <span>Joined: {formatDate(userData.createdAt)}</span>
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
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800"
                        >
                            <Edit size={14} />
                            Edit
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <ProfileField
                                label="First Name"
                                value={userData.firstName || 'Not Available'}
                                icon={<User size={14} />}
                            />
                            <ProfileField
                                label="Last Name"
                                value={userData.lastName || 'Not Available'}
                                icon={<User size={14} />}
                            />
                            <ProfileField
                                label="Email Address"
                                value={userData.email}
                                icon={<Mail size={14} />}
                            />
                            <ProfileField
                                label="User Type"
                                value={getUserRole(userData.type)}
                                icon={<Briefcase size={14} />}
                            />
                            <ProfileField
                                label="User ID"
                                value={
                                    <span className="font-mono text-xs text-slate-600">
                                        {userData._id}
                                    </span>
                                }
                                icon={<Globe size={14} />}
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
                                value={<StatusBadge status={getStatus(userData.status)} />}
                                icon={<Users size={14} />}
                            />
                            <ProfileField
                                label="Created Date"
                                value={formatDate(userData.createdAt)}
                                icon={<Calendar size={14} />}
                            />
                            <ProfileField
                                label="Last Updated"
                                value={formatDate(userData.updatedAt)}
                                icon={<Clock size={14} />}
                            />
                            <ProfileField
                                label="Admin Role"
                                value={
                                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200/60 bg-indigo-50/50 px-3 py-1 text-xs font-medium text-indigo-700">
                                        <Shield size={12} />
                                        {getUserRole(userData.type)}
                                    </span>
                                }
                                icon={<Shield size={14} />}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <EditProfileModal
                isOpen={isEditModalOpen}
                user={userData}
                isLoading={updateProfileLoading}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleEditProfile}
            />
        </div>
    );
}