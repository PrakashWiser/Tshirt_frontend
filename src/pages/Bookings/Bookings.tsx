import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../../components/Taple";
import type { ColumnDef } from "../../components/Types";
import Button from "../../components/Button";
import { Download, Plus } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { checkInBooking, checkOutBooking, clearBookingError, getAllBookings } from "../../store/slice/bookingSlice";
import CreateBooking from "./CreateBooking";
import { addToast } from "../../store/slice/uiSlice";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import DotMenu from "../../components/DotMenu";
import { deleteBooking } from "../../store/slice/bookingSlice";
import { exportTableData } from "../../utils/exportToExcel";
import { useNavigate } from "react-router-dom";



interface Booking {
    id: string;
    guest: string;
    property: string;
    room: string;
    checkIn: string;
    checkOut: string;
    amount: string;
    status: string;
    paymentMode: string;
    paymentType: string;
}


export default function BookingsSection() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const { error, message, bookings } = useAppSelector((state) => state.booking);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getAllBookings());
    }, [dispatch]);



    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllBookings());
            setOpen(false);
            dispatch(clearBookingError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearBookingError());
        }
    }, [message, error, dispatch]);



    const columns = useMemo<ColumnDef<Booking>[]>(
        () => [
            {
                key: "id",
                header: "BOOKING ID",
                accessor: "id",
                sortable: true,
            },
            {
                key: "guest",
                header: "GUEST",
                accessor: "guest",
                sortable: true,
            },
            {
                key: "property",
                header: "PROPERTY / ROOM",
                accessor: "property",
                render: (_, row) => (
                    <div>
                        <p className="font-medium">{row.property}</p>
                        <p className="text-xs text-slate-400">{row.room}</p>
                    </div>
                ),
            },
            {
                key: "checkIn",
                header: "CHECK-IN",
                accessor: "checkIn",
                sortable: true,
            },
            {
                key: "checkOut",
                header: "CHECK-OUT",
                accessor: "checkOut",
                sortable: true,
            },

            {
                key: "amount",
                header: "AMOUNT",
                accessor: "amount",
                align: "right",
            },
            {
                key: "paymentMode",
                header: "PAYMENT MODE",
                accessor: "paymentMode",
                render: (value) => {
                    const mode = String(value).toLowerCase();

                    return (
                        <span
                            className={`rounded-full px-3 text-xs font-medium ${mode === "online"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-blue-100 text-blue-700 border border-blue-200"
                                }`}
                        >
                            {mode === "online" ? "Online" : "Offline"}
                        </span>
                    );
                },
            },
            {
                key: "paymentType",
                header: "PAYMENT TYPE",
                accessor: "paymentType",
                render: (value) => {
                    const type = String(value);

                    const labels: Record<string, string> = {
                        advance_payment: "Advance Payment",
                        pay_at_property: "Pay at Property",
                    };

                    const colors: Record<string, string> = {
                        advance_payment:
                            "bg-emerald-100 text-emerald-700 border border-emerald-200",
                        pay_at_property:
                            "bg-orange-100 text-orange-700 border border-orange-200",
                    };

                    return (
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors[type] ??
                                "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                        >
                            {labels[type] ?? type}
                        </span>
                    );
                },
            },
            {
                key: "status",
                header: "STATUS",
                accessor: "status",
                render: (value) => {
                    const status = String(value);

                    const colors: Record<string, string> = {
                        Confirmed:
                            "bg-blue-100 text-blue-700 border border-blue-200",
                        "Checked In":
                            "bg-green-100 text-green-700 border border-green-200",
                        "Checked Out":
                            "bg-gray-100 text-gray-700 border border-gray-200",
                        Pending:
                            "bg-yellow-100 text-yellow-700 border border-yellow-200",
                        Cancelled:
                            "bg-red-100 text-red-700 border border-red-200",
                    };

                    return (
                        <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[status] ??
                                "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                        >
                            {status}
                        </span>
                    );
                },
            },

            {
                key: "actions",
                header: "ACTIONS",
                accessor: "id",
                render: (_, row: any) => {
                    const status = row.statusRaw.toLowerCase();

                    return (
                        <DotMenu
                            onCheckIn={
                                status === "confirmed"
                                    ? () => dispatch(checkInBooking(row._id))
                                    : undefined
                            }
                            onCheckOut={
                                status === "checked_in"
                                    ? () => dispatch(checkOutBooking(row._id))
                                    : undefined
                            }
                            onDelete={() => handleDelete(row._id)}
                        />
                    );
                },
            }
        ],
        []
    );

    const bookingData = useMemo(() => {
        return (bookings || []).map((booking: any) => ({
            id: booking.bookingId,
            _id: booking._id,
            guest: booking.customer?.name,
            statusRaw: booking.status,
            property: booking.propertyId?.propertyName,
            room: booking.roomId?.roomName,
            checkIn: booking.checkInDate?.split("T")[0],
            checkOut: booking.checkOutDate?.split("T")[0],
            amount: `₹${booking.pricing?.totalAmount?.toLocaleString("en-IN")}`,
            status:
                booking.status.charAt(0).toUpperCase() +
                booking.status.slice(1),
            paymentMode: booking.paymentMode,
            paymentType: booking.paymentType,
        }));
    }, [bookings]);

    const handleExport = () => {
        exportTableData(
            bookingData as Booking[],
            columns,
            "Bookings"
        );
    };


    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!deleteId) return;

        dispatch(deleteBooking(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };


    if (open) {
        return (
            <CreateBooking
            />
        );
    }
    return (
        <>
            <div className="py-4">
                <DataTable<Booking>
                    onRowClick={(row: any) => navigate(`/bookings/${row._id}`)}
                    data={bookingData}
                    columns={columns}
                    rowKey="id"
                    searchKeys={[
                        "id",
                        "guest",
                        "property",
                        "room",
                        "status",
                    ]}

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
                                onClick={() => setOpen(true)}
                                className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-xs font-medium"
                            >
                                <Plus size={16} />
                                Add Booking
                            </Button>
                        </div>
                    }
                    searchPlaceholder="Search bookings..."
                    defaultView="table"
                    pageSize={10}
                    stickyHeader
                />
            </div>
            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this booking?"
                onConfirm={confirmDelete}
                onCancel={() => {
                    setDeleteModal(false);
                    setDeleteId(null);
                }}
            />
        </>
    );
}