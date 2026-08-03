import { Download, MapPin, Plus, Star } from "lucide-react";
import type { ColumnDef } from "../../components/TableTypes";
import { DataTable } from "../../components/Table";
import DotMenu from "../../components/DotMenu";
import Button from "../../components/Button";
import { useEffect, useState } from "react";
import CreateProperty from "./CreateProperty";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import { clearPropertyError, deleteProperty, getAllProperties } from "../../store/slice/propertySlice";
import type { Property } from "../../types";
import CustomImage from "../../components/Image";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../hooks/usePermission";


export interface PropertyResponse {
    properties: Property[];
    meta: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

export default function VillaSection() {
    const [openForm, setOpenForm] = useState(false);
    const dispatch = useAppDispatch()
    const navigate = useNavigate();
    const { hasPermission } = usePermission();
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedRooms, setSelectedRooms] = useState<Property | null>(null);
    const {
        isLoading,
        error,
        message,
        properties
    } = useAppSelector((state) => state.property);


    useEffect(() => {
        dispatch(getAllProperties());
    }, [dispatch]);


    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllProperties());
            setSelectedRooms(null)
            setOpenForm(false)
            dispatch(clearPropertyError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearPropertyError());
        }
    }, [message, error, dispatch]);

    const columns: ColumnDef<Property>[] = [
        {
            key: "propertyName",
            header: "Property Name",
            accessor: "propertyName",
        },
        {
            key: "location",
            header: "Location",
            accessor: (row) =>
                `${row.locationId?.city ?? "-"}, ${row.locationId?.state ?? ""}`,
        },
        {
            key: "category",
            header: "Category",
            accessor: "category",
        },
        {
            key: "rating",
            header: "Rating",
            accessor: (row) => row.starRating ?? 0,
        },
    ];


    const handleView = (id: string) => {
        navigate(`/properties/view/${id}`);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const handleEdit = (property: Property) => {
        setSelectedRooms(property);
        setOpenForm(true);
    };


    const handleAddLocation = () => {
        setSelectedRooms(null);
        setOpenForm(true);
    };



    const handleExport = () => {
        exportTableData(
            properties,
            columns,
            "Properties"
        );
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await dispatch(deleteProperty(deleteId));
            setDeleteModal(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (openForm) {
        return (
            <CreateProperty
                selectedProperty={selectedRooms}
                loading={isLoading}
                onClose={() => {
                    setSelectedRooms(null);
                    setOpenForm(false);
                }}
            />
        );
    }

    return (
        <>
            <DataTable
                data={properties}
                columns={columns}
                rowKey="_id"
                defaultView="grid"
                searchKeys={["propertyName", "category"]}
                searchPlaceholder="Search properties..."
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
                        {hasPermission("properties.create") && (
                            <Button
                                onClick={handleAddLocation}
                                className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-xs font-medium"
                            >
                                <Plus size={16} />
                                Add Properties
                            </Button>)}
                    </div>
                }
                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                renderGridCard={(property) => (
                    <div key={property?._id} className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="relative h-44">
                            <CustomImage
                                src={property.propertyImages?.[0]}
                                alt={property.propertyName}
                                className="h-full w-full object-cover transition-all duration-500 ease-in-out hover:scale-105"
                            />

                            <span
                                className={`absolute left-3 top-3 px-2 py-1 rounded-full text-[11px] font-medium ${property.status === 1
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {property.status === 1 ? "Active" : "Inactive"}
                            </span>

                            <div className="absolute right-3 top-3">
                                <DotMenu
                                    showEdit={hasPermission("locations.update")}
                                    showDelete={hasPermission("locations.delete")}
                                    onView={() => handleView(property._id)}
                                    onEdit={() => handleEdit(property)}
                                    onDelete={() => handleDelete(property._id)}
                                />
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-slate-900 line-clamp-1">
                                    {property.propertyName}
                                </h3>

                                <div className="flex items-center gap-1 text-sm font-medium">
                                    <Star
                                        size={14}
                                        className="fill-yellow-400 text-yellow-400"
                                    />
                                    {property.starRating}
                                </div>
                            </div>
                            <div className="mt-1 flex items-center capitalize gap-1 text-xs text-slate-500">
                                <MapPin size={12} />
                                {property.locationId?.city}, {property.locationId?.state}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {property.amenities?.slice(0, 3).map((item) => (
                                    <span
                                        key={item}
                                        className="px-2 py-1 text-xs rounded bg-slate-100"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-4 text-xs text-slate-500">
                                Category: {property.category}
                            </div>
                        </div>
                    </div>
                )}
            />
            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this property?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteModal(false);
                    setDeleteId(null);
                }}
            />
        </>
    );
}