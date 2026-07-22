import {
    BedDouble,
    Building2,
    Download,
    Plus,
    Wrench,
    Star,
    Clock,
} from "lucide-react";
import { DataTable } from "../../components/Taple";
import type { ColumnDef } from "../../components/Types";
import Button from "../../components/Button";
import { useEffect, useState } from "react";
import CreateRoom from "./CreateRoom";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { clearRoomError, deleteRoom, getAllRooms } from "../../store/slice/roomSlice";
import { addToast } from "../../store/slice/uiSlice";
import type { Room } from "../../types";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";
import { useNavigate } from "react-router-dom";
import CustomImage from "../../components/Image";

interface RoomRow {
    _id: string;
    image: string;
    roomName: string;
    roomType: string;
    property: string;
    stayType: string;
    guests: number;
    price: number;
    status: string;
    featured: boolean;
    starRating: number;
    category: string;
}

export default function RoomSection() {
    const navigate = useNavigate();
    const [openForm, setOpenForm] = useState(false);
    const dispatch = useAppDispatch();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const { isLoading, error, message, rooms, } = useAppSelector((state) => state.rooms);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getAllRooms());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllRooms());
            setSelectedRoom(null);
            setOpenForm(false);
            dispatch(clearRoomError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearRoomError());
        }
    }, [message, error, dispatch]);

    const stats = [
        {
            title: "Total Rooms",
            value: rooms.length,
            icon: BedDouble,
            bg: "bg-slate-50",
            iconColor: "text-slate-800",
            valueColor: "text-slate-900",
        },
        {
            title: "Featured",
            value: rooms.filter((r) => r.isFeatured).length,
            icon: Building2,
            bg: "bg-green-50",
            iconColor: "text-green-600",
            valueColor: "text-green-600",
        },
        {
            title: "Hourly Stay",
            value: rooms.filter((r) => r.stayType === "hourly" || r.stayType === "both").length,
            icon: Clock,
            bg: "bg-blue-50",
            iconColor: "text-blue-600",
            valueColor: "text-blue-600",
        },
        {
            title: "Daily Stay",
            value: rooms.filter((r) => r.stayType === "daily" || r.stayType === "both").length,
            icon: Wrench,
            bg: "bg-amber-50",
            iconColor: "text-amber-600",
            valueColor: "text-amber-600",
        },
    ];

    const roomData: RoomRow[] = rooms?.map((room) => ({
        _id: room._id,
        image: room.roomImages?.[0] || "",
        roomName: room.roomName,
        roomType: room.roomType,
        property: typeof room.propertyId === "object"
            ? room.propertyId?.propertyName || "-"
            : "-",
        stayType: room.stayType ?? "daily",
        guests: room.capacity?.maxGuests ?? 0,
        price: room.pricing?.offerPrice ?? room.pricing?.actualPrice ?? 0,
        status: room.status === 1 ? "Active" : "Inactive",
        featured: room.isFeatured ?? false,
        starRating: room.starRating ?? 0,
        category: room.category ?? "",
    }));

    

    const columns: ColumnDef<RoomRow>[] = [
        {
            key: "image",
            header: "Image",
            accessor: "image",
            render: (value) => (
                <CustomImage
                    src={String(value)}
                    alt="Room"
                    className="w-14 h-14 rounded-lg object-cover"
                />
            ),
        },
        { key: "roomName", header: "Room Name", accessor: "roomName" },
        {
            key: "roomType",
            header: "Room Type",
            accessor: "roomType",
            render: (value) =>
                String(value).replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        },
        { key: "property", header: "Property", accessor: "property" },
        { key: "stayType", header: "Stay Type", accessor: "stayType" },
        { key: "guests", header: "Max Guests", accessor: "guests" },
        {
            key: "price",
            header: "Price",
            accessor: "price",
            render: (value) => `₹${Number(value).toLocaleString()}`,
        },
        { key: "status", header: "Status", accessor: "status" },
        {
            key: "starRating",
            header: "Rating",
            accessor: "starRating",
            render: (value) => `${value} ★`,
        },
    ];

    const handleAddRoom = () => {
        setSelectedRoom(null);
        setOpenForm(true);
    };


    const handleView = (id: string) => {
        navigate(`/rooms/view/${id}`);
    };

    const handleEdit = (room: Room) => {
        setSelectedRoom(room);
        setOpenForm(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        dispatch(deleteRoom(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };


    if (openForm) {
        return (
            <CreateRoom
                selectedRoom={selectedRoom}
                loading={isLoading}
                onClose={() => {
                    setSelectedRoom(null);
                    setOpenForm(false);
                }}
            />
        );
    }

    const handleExport = () => {
        exportTableData(roomData, columns, "Rooms");
    };


    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 pb-6">
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.title}
                            className={`${item.bg} rounded-2xl border border-slate-200 p-5`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={22} className={item.iconColor} />
                                <div>
                                    <h3 className={`text-3xl font-bold ${item.valueColor}`}>
                                        {item.value}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-1">{item.title}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <DataTable
                data={roomData}
                columns={columns}
                rowKey="_id"
                searchKeys={["roomName", "roomType", "property", "stayType"]}
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
                            onClick={handleAddRoom}
                            className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-xs font-medium"
                        >
                            <Plus size={16} />
                            Add Room
                        </Button>
                    </div>
                }
                defaultView="grid"
                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                renderGridCard={(row: RoomRow) => {
                    const originalRoom = rooms.find((r) => r._id === row._id);

                    return (
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <BedDouble size={22} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${row.status === "Active"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                            }`}>
                                            {row.status}
                                        </span>
                                        {row.featured && (
                                            <span className="ml-2 inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                                                <Star size={14} fill="currentColor" /> Featured
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <DotMenu
                                    onView={() => handleView(row._id)}
                                    onEdit={() => originalRoom && handleEdit(originalRoom)}
                                    onDelete={() => handleDelete(row._id)}
                                />
                            </div>

                            <h3 className="text-lg font-bold line-clamp-2 mb-1">{row.roomName}</h3>
                            <p className="text-slate-500 text-sm mb-3">
                                {row.roomType.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                {row.category && ` • ${row.category}`}
                            </p>

                            <div className="flex justify-between items-center text-sm mb-4">
                                <div>
                                    <p className="text-slate-400 text-xs">Max Guests</p>
                                    <p className="font-medium">{row.guests}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 text-xs">Stay Type</p>
                                    <p className="font-medium capitalize">{row.stayType}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-xs">Price</p>
                                    <p className="font-bold text-lg">₹{row.price.toLocaleString()}</p>
                                </div>
                            </div>

                            {originalRoom?.pricing && (
                                <div className="text-xs text-slate-500">
                                    Actual: ₹{originalRoom.pricing.actualPrice} | Tax: {originalRoom.pricing.taxPercentage}%
                                </div>
                            )}
                        </div>
                    );
                }}
            />


            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this room?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteModal(false);
                    setDeleteId(null);
                }}
            />
        </>
    );
}