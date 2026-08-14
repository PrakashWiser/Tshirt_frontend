import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Image as ImageIcon } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import DotMenu from "../../components/DotMenu";
import Button from "../../components/Button";
import CreateAmenity from "./CreateAmenitySection";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearAmenityError,
    deleteAmenity,
    getAllAmenities,
    updateAmenityStatus,
} from "../../store/slice/premiumAmenitySlice";

import type { PremiumAmenity } from "../../store/slice/premiumAmenitySlice";
import CustomImage from "../../components/Image";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";

export default function AmenitySection() {
    const dispatch = useAppDispatch();
    const [openForm, setOpenForm] = useState(false);
    const [selectedAmenity, setSelectedAmenity] = useState<PremiumAmenity | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const {
        message,
        error,
        amenities: datas,
    } = useAppSelector((state) => state.premiumAmenities);

    useEffect(() => {
        dispatch(getAllAmenities());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllAmenities());
            setSelectedAmenity(null);
            setOpenForm(false);
            dispatch(clearAmenityError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearAmenityError());
        }
    }, [message, error, dispatch]);

    const columns = useMemo<ColumnDef<PremiumAmenity>[]>(
        () => [
            {
                key: "name",
                header: "Amenity Name",
                accessor: "name"
            },
            {
                key: "slug",
                header: "Slug",
                accessor: "slug"
            },
            {
                key: "status",
                header: "Status",
                accessor: (row) => {
                    if (row.status === 1) return "Active";
                    if (row.status === 2) return "Deleted";
                    return "Inactive";
                },
            },
            {
                key: "icon",
                header: "Icon",
                accessor: "icon",
                render: (value, row) => {
                    return value ? (
                        <CustomImage
                            src={String(value)}
                            alt={row.name}
                            className="h-10 w-10 object-contain rounded-lg border border-slate-200"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
                            <ImageIcon size={20} className="text-slate-400" />
                        </div>
                    );
                },
            },
        ],
        []
    );

    const handleAddAmenity = () => {
        setSelectedAmenity(null);
        setOpenForm(true);
    };

    const handleEdit = (amenity: PremiumAmenity) => {
        setSelectedAmenity(amenity);
        setOpenForm(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const handleExport = () => {
        exportTableData(
            datas as PremiumAmenity[],
            columns,
            "PremiumAmenities"
        );
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await dispatch(deleteAmenity(deleteId));
            setDeleteModal(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
        }
    };



    const toggleStatus = (amenity: PremiumAmenity) => {
        const currentStatus = Number(amenity.status);
        const newStatus: 0 | 1 = currentStatus === 1 ? 0 : 1;
        dispatch(
            updateAmenityStatus({
                id: amenity._id,
                status: newStatus,
            })
        );
    };


    if (openForm) {
        return (
            <CreateAmenity
                selectedAmenity={selectedAmenity}
                onClose={() => {
                    setSelectedAmenity(null);
                    setOpenForm(false);
                }}
            />
        );
    }

    return (
        <>
            <DataTable<PremiumAmenity>
                data={(datas as PremiumAmenity[]) || []}
                columns={columns}
                rowKey="_id"
                defaultView="grid"
                pageSize={9}
                searchKeys={["name", "slug"]}
                searchPlaceholder="Search amenities..."
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"
                        >
                            <Download size={16} />
                            Export
                        </Button>
                        <Button
                            className="flex items-center gap-2 px-4 h-9 rounded-lg  text-white text-xs font-medium"
                            onClick={handleAddAmenity}
                        >
                            <Plus size={16} />
                            Add Amenity
                        </Button>
                    </div>
                }
                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5"
                renderGridCard={(amenity) => (
                    <div
                        key={amenity?._id}
                        className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                        <div className="relative h-32 bg-slate-50 flex items-center justify-center">
                            {amenity.icon ? (
                                <CustomImage
                                    src={amenity.icon}
                                    alt={amenity.name}
                                    className="h-20 w-20 object-contain transition-all duration-500 ease-in-out"
                                />
                            ) : (
                                <ImageIcon size={36} className="text-slate-300" />
                            )}

                            <span
                                className={`absolute left-3 top-3 px-2 py-1 rounded-full text-xs font-medium ${Number(amenity.status) === 1
                                        ? "bg-green-100 text-green-700"
                                        : Number(amenity.status) === 2
                                            ? "bg-red-100 text-red-700"
                                            : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {Number(amenity.status) === 1
                                    ? "Active"
                                    : Number(amenity.status) === 2
                                        ? "Deleted"
                                        : "Inactive"}
                            </span>

                            <div className="absolute right-3 top-3">
                                <DotMenu
                                    onEdit={() => handleEdit(amenity)}
                                    onDelete={() => handleDelete(amenity._id)}
                                />
                            </div>
                        </div>

                        <div className="p-4 capitalize">
                            <h3 className="font-semibold text-slate-900 text-lg">
                                {amenity.name}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1 truncate">
                                slug: {amenity.slug}
                            </p>

                            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                <span className="text-xs text-slate-400">
                                    Created: {new Date(amenity.createdAt).toLocaleDateString()}
                                </span>

                                {Number(amenity.status) !== 2 && (
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-xs font-medium ${Number(amenity.status) === 1
                                                    ? "text-[#3A29AA]"
                                                    : "text-slate-400"
                                                }`}
                                        >
                                            {Number(amenity.status) === 1 ? "Active" : "Inactive"}
                                        </span>

                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={Number(amenity.status) === 1}
                                            onClick={() => toggleStatus(amenity)}
                                            className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${Number(amenity.status) === 1
                                                    ? "bg-[#3A29AA]"
                                                    : "bg-slate-200"
                                                }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${Number(amenity.status) === 1
                                                        ? "translate-x-4"
                                                        : "translate-x-0"
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            />

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this amenity?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteModal(false);
                    setDeleteId(null);
                }}
            />


        </>
    );
}