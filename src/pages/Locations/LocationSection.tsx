import { useEffect, useMemo, useState } from "react";
import { Download, MapPin, Plus } from "lucide-react";
import { DataTable } from "../../components/Taple";
import type { ColumnDef } from "../../components/Types";
import DotMenu from "../../components/DotMenu";
import Button from "../../components/Button";
import CreateLocation from "./CreateLocation";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import { clearLocationError, deleteLocation, getAllLocations } from "../../store/slice/locationSlice";
import CustomImage from "../../components/Image";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";
import { usePermission } from "../../hooks/usePermission";

export interface SubLocation {
    _id: string;
    name: string;
    slug: string;
    image: string;
    isPopular: boolean;
}

export interface Location {
    _id: string;
    name: string;
    slug: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    image: string;
    mapLink: string;
    subLocations: SubLocation[];
    isPopular: boolean;
    status: 0 | 1;
    createdAt: string;
    updatedAt: string;
}


export default function LocationSection() {
    const dispatch = useAppDispatch();
    const { hasPermission } = usePermission();
    const [openForm, setOpenForm] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const {
        message,
        error,
        locations: datas,
    } = useAppSelector((state) => state.locations);


    useEffect(() => {
        dispatch(getAllLocations());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllLocations());
            setSelectedLocation(null)
            setOpenForm(false)
            dispatch(clearLocationError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearLocationError());
        }
    }, [message, error, dispatch]);

    const columns = useMemo<ColumnDef<Location>[]>(
        () => [
            { key: "name", header: "Location", accessor: "name" },
            { key: "city", header: "City", accessor: "city" },
            { key: "state", header: "State", accessor: "state" },
            {
                key: "status",
                header: "Status",
                accessor: (row) => (row.status === 1 ? "Active" : "Inactive"),
            },
        ],
        []
    );

    const handleAddLocation = () => {
        setSelectedLocation(null);
        setOpenForm(true);
    };

    const handleEdit = (location: Location) => {
        setSelectedLocation(location);
        setOpenForm(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };


    const handleExport = () => {
        exportTableData(
            datas as Location[],
            columns,
            "Locations"
        );
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            dispatch(deleteLocation(deleteId))
            setDeleteModal(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (openForm) {
        return (
            <CreateLocation
                selectedLocation={selectedLocation}
                onClose={() => {
                    setSelectedLocation(null);
                    setOpenForm(false);
                }}
            />
        );
    }

    return (
        <>
            <DataTable<Location>
                data={(datas as Location[]) || []}
                columns={columns}
                rowKey="_id"
                defaultView="grid"
                pageSize={9}
                searchKeys={["name", "city", "state"]}
                searchPlaceholder="Search locations..."
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
                        {hasPermission("locations.create") && (
                            <Button
                                className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-xs font-medium"
                                onClick={handleAddLocation}
                            >
                                <Plus size={16} />
                                Add Location
                            </Button>
                        )}
                    </div>
                }
                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                renderGridCard={(location) => (
                    <div key={location?._id} className="overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                        <div className="relative h-50">
                            <CustomImage
                                src={location.image}
                                alt={location.name}
                                className="h-full w-full object-cover transition-all duration-500 ease-in-out hover:scale-105"
                            />
                            <span
                                className={`absolute left-3 top-3 px-2 py-1 rounded-full text-xs font-medium ${location.status === 1
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {location.status === 1 ? "Active" : "Inactive"}
                            </span>
                            <div className="absolute right-3 top-3">
                                <DotMenu
                                    showEdit={hasPermission("locations.update")}
                                    showDelete={hasPermission("locations.delete")}
                                    onEdit={() => handleEdit(location)}
                                    onDelete={() => handleDelete(location._id)}
                                />
                            </div>
                        </div>

                        <div className="p-4 capitalize">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-blue-600" />
                                <h3 className="font-semibold text-slate-900">{location.name}</h3>
                            </div>
                            <p className="text-sm  text-slate-500 mt-1">
                                {location.city}, {location.state}
                            </p>
                            {location.subLocations.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                    {location.subLocations
                                        .slice(0, 3)
                                        .map((sub) => (
                                            <span
                                                key={sub._id}
                                                className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
                                            >
                                                {sub.name}
                                            </span>
                                        ))}
                                    {location.subLocations.length > 3 && (
                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-xs rounded-full">
                                            +{location.subLocations.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            />
            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this location?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteModal(false);
                    setDeleteId(null);
                }}
            />
        </>
    );
}