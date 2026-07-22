import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { createVendor, getVendorPermissions, setVendorPermissions, updateVendor } from '../../store/slice/vendorSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/hooks';
import { addToast } from '../../store/slice/uiSlice';
import ReusableForm, { type FormField } from '../../components/ReusableForm';

interface CreateVendorProps {
    onClose: () => void;
    selectedVendor?: any | null;
}

export default function CreateVendor({ onClose, selectedVendor }: CreateVendorProps) {
    const dispatch = useAppDispatch();
    const { isLoading, error, permissions, message } = useAppSelector((state: any) => state.vendor);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        dispatch(getVendorPermissions() as any);
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            onClose();
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
        }
    }, [message, error, dispatch, onClose]);

    useEffect(() => {
        if (selectedVendor?.vendorProfile?.permissions) {
            setSelectedPermissions(selectedVendor.vendorProfile.permissions);
        }
    }, [selectedVendor]);

    const initialValues = {
        name: selectedVendor?.name || selectedVendor?.ownerName || '',
        email: selectedVendor?.email || '',
        phone: selectedVendor?.phone || '',
        password: '',
        businessName: selectedVendor?.vendorProfile?.businessName || selectedVendor?.companyName || '',
        gstNumber: selectedVendor?.vendorProfile?.gstNumber || '',
        panNumber: selectedVendor?.vendorProfile?.panNumber || '',
        bankDetails: selectedVendor?.vendorProfile?.bankDetails || {
            accountNo: '',
            ifsc: '',
            bankName: '',
            accountHolderName: ''
        },
        approvalStatus: selectedVendor?.vendorProfile?.approvalStatus || selectedVendor?.status || 'pending',
        permissions: [],
    };

    const fields: FormField[] = [
        {
            name: 'name',
            label: 'Owner Name',
            type: 'text',
            placeholder: 'Enter owner name',
            required: true,
        },
        {
            name: 'businessName',
            label: 'Business Name',
            type: 'text',
            placeholder: 'Enter business name',
            required: true,
        },
        {
            name: 'email',
            label: 'Email',
            type: 'email',
            placeholder: 'Enter email address',
            required: true,
        },
        {
            name: 'phone',
            label: 'Phone',
            type: 'text',
            placeholder: 'Enter phone number',
            required: true,
        },
        {
            name: 'gstNumber',
            label: 'GST Number',
            type: 'text',
            placeholder: 'Enter GST number',
        },
        {
            name: 'panNumber',
            label: 'PAN Number',
            type: 'text',
            placeholder: 'Enter PAN number',
        },
        {
            name: 'approvalStatus',
            label: 'Approval Status',
            type: 'select',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Rejected', value: 'rejected' },
            ],
            placeholder: 'Select approval status',
        },
    ];

    if (!selectedVendor) {
        fields.push({
            name: 'password',
            label: 'Password',
            type: 'password',
            placeholder: 'Enter password',
            required: true,
        });
    }

    fields.push({
        name: 'bankDetails',
        label: 'Bank Details',
        type: 'json-object',
        schema: [
            { key: 'accountHolderName', label: 'Account Holder Name', type: 'text' },
            { key: 'accountNo', label: 'Account Number', type: 'text' },
            { key: 'bankName', label: 'Bank Name', type: 'text' },
            { key: 'ifsc', label: 'IFSC Code', type: 'text' },
        ],
        required: false,
        fullWidth: true,
    });

    const handleSubmit = async (formData: Record<string, any>) => {
        const payload: any = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            businessName: formData.businessName,
            gstNumber: formData.gstNumber || '',
            panNumber: formData.panNumber || '',
            approvalStatus: formData.approvalStatus || 'pending',
            bankDetails: formData.bankDetails || {
                accountNo: '',
                ifsc: '',
                bankName: '',
                accountHolderName: ''
            },
            permissions: selectedPermissions,
        };

        if (!selectedVendor && formData.password) {
            payload.password = formData.password;
        }

        if (selectedVendor) {
            payload.id = selectedVendor._id || selectedVendor.id;
        }
        if (selectedVendor) {
            const result = await dispatch(
                updateVendor({
                    id: selectedVendor._id || selectedVendor.id,
                    data: payload,
                }) as any
            );

            if (updateVendor.fulfilled.match(result)) {
                if (selectedPermissions.length > 0) {
                    await dispatch(
                        setVendorPermissions({
                            id: selectedVendor._id || selectedVendor.id,
                            permissions: selectedPermissions,
                        }) as any
                    );
                }
            }
        } else {
            const result = await dispatch(createVendor(payload) as any);
            if (createVendor.fulfilled.match(result)) {
                const vendorId =
                    result.payload?.vendorId || result.payload?.id;

                if (selectedPermissions.length > 0 && vendorId) {
                    await dispatch(
                        setVendorPermissions({
                            id: vendorId,
                            permissions: selectedPermissions,
                        }) as any
                    );
                }
            }
        }
    };

    const handlePermissionToggle = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSelectAllCategory = (categoryPermissions: string[]) => {
        const allSelected = categoryPermissions.every(perm => selectedPermissions.includes(perm));

        if (allSelected) {
            setSelectedPermissions(prev =>
                prev.filter(perm => !categoryPermissions.includes(perm))
            );
        } else {
            setSelectedPermissions(prev => {
                const newPermissions = new Set(prev);
                categoryPermissions.forEach(perm => newPermissions.add(perm));
                return Array.from(newPermissions);
            });
        }
    };

    const handleSelectAllPermissions = () => {
        if (selectedPermissions.length === permissions.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions([...permissions]);
        }
    };

    const groupedPermissions = permissions.reduce((acc: Record<string, string[]>, permission: string) => {
        const category = permission.split(".")[0];
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {});

    const isAllPermissionsSelected = permissions.length > 0 && selectedPermissions.length === permissions.length;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between py-4 mb-10">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-black p-2">
                            <UserPlus size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900">
                                {selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
                            </h2>
                            <p className="text-sm text-slate-500">
                                {selectedVendor ? 'Update vendor details' : 'Create a new vendor and configure permissions'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pb-6">
                    {permissions.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-4 p-4 bg-white rounded-lg border border-slate-200">
                                <h3 className="text-sm font-semibold text-slate-700">
                                    Permissions
                                </h3>
                                <button
                                    type="button"
                                    onClick={handleSelectAllPermissions}
                                    className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 transition-colors"
                                >
                                    {isAllPermissionsSelected ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>

                            {Object.entries(groupedPermissions).map(([category, perms]) => {
                                const categoryPermissions = perms as string[];
                                const allCategorySelected = categoryPermissions.every(perm =>
                                    selectedPermissions.includes(perm)
                                );

                                return (
                                    <div
                                        key={category}
                                        className="rounded-lg border border-slate-200 p-4 mb-4 bg-white"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold capitalize text-slate-700">
                                                {category}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => handleSelectAllCategory(categoryPermissions)}
                                                className="text-xs font-medium text-black hover:text-gray-600 transition-colors"
                                            >
                                                {allCategorySelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {categoryPermissions.map((perm) => {
                                                const action = perm.split(".")[1];
                                                return (
                                                    <label
                                                        key={perm}
                                                        className="flex items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50 cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedPermissions.includes(perm)}
                                                            onChange={() => handlePermissionToggle(perm)}
                                                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-black focus:ring-black"
                                                        />
                                                        <div>
                                                            <p className="text-sm font-medium text-slate-700 capitalize">
                                                                {action}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {perm}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <ReusableForm
                    fields={fields}
                    initialValues={initialValues}
                    submitText={selectedVendor ? 'Update Vendor' : 'Create Vendor'}
                    loading={isLoading}
                    onSubmit={handleSubmit}
                    onClose={onClose}
                />
            </div>
        </div>
    );
}