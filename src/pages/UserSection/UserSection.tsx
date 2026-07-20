import { useMemo } from "react";
import { DataTable } from "../../components/Taple";
import type { ColumnDef } from "../../components/Types";
import DotMenu from "../../components/DotMenu";
import { Download, Plus } from "lucide-react";
import Button from "../../components/Button";

interface User {
    id: number;
    name: string;
    email: string;
    status: "Active" | "Inactive" | "Suspended";
    plan: string;
    bookings: number;
    totalSpent: string;
    location: string;
}

const users: User[] = [
    {
        id: 1,
        name: "Priya Sharma",
        email: "priya.sharma@gmail.com",
        status: "Active",
        plan: "Platinum",
        bookings: 24,
        totalSpent: "₹4.2L",
        location: "Mumbai",
    },
    {
        id: 2,
        name: "Rahul Mehta",
        email: "rahul@gmail.com",
        status: "Active",
        plan: "Gold",
        bookings: 18,
        totalSpent: "₹2.8L",
        location: "Delhi",
    },
    {
        id: 3,
        name: "Ananya Iyer",
        email: "ananya@gmail.com",
        status: "Suspended",
        plan: "Silver",
        bookings: 6,
        totalSpent: "₹84K",
        location: "Chennai",
    },
    {
        id: 4,
        name: "Vikram Nair",
        email: "vikram@gmail.com",
        status: "Active",
        plan: "Platinum",
        bookings: 31,
        totalSpent: "₹5.6L",
        location: "Bengaluru",
    },
    {
        id: 5,
        name: "Deepika Rao",
        email: "deepika@gmail.com",
        status: "Active",
        plan: "Gold",
        bookings: 12,
        totalSpent: "₹1.4L",
        location: "Hyderabad",
    },
    {
        id: 6,
        name: "Arjun Patel",
        email: "arjun@gmail.com",
        status: "Inactive",
        plan: "Bronze",
        bookings: 3,
        totalSpent: "₹38K",
        location: "Ahmedabad",
    },
    {
        id: 7,
        name: "Sneha Gupta",
        email: "sneha@gmail.com",
        status: "Active",
        plan: "Gold",
        bookings: 19,
        totalSpent: "₹3.1L",
        location: "Pune",
    },
    {
        id: 8,
        name: "Karthik Reddy",
        email: "karthik@gmail.com",
        status: "Active",
        plan: "Silver",
        bookings: 8,
        totalSpent: "₹92K",
        location: "Vizag",
    },
];

export default function UserSection() {
    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                key: "name",
                header: "Name",
                accessor: "name",
            },
            {
                key: "email",
                header: "Email",
                accessor: "email",
            },
            {
                key: "status",
                header: "Status",
                accessor: "status",
            },
            {
                key: "location",
                header: "Location",
                accessor: "location",
            },
        ],
        []
    );

    const getInitials = (name: string) =>
        name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase();

    const handleEdit = (user: User) => {
        console.log("Edit User", user);
    };

    const handleDelete = (id: number) => {
        console.log("Delete User", id);
    };

    return (
        <DataTable
            data={users}
            columns={columns}
            rowKey="id"
            defaultView="grid"
            pageSize={9}
            actions={
                <div className="flex items-center gap-2">
                    <Button

                        variant="outline"
                        className="px-4 h-9 rounded-lg border  border-slate-200 bg-white text-sm"
                    >
                        <Download size={16} />
                        Export
                    </Button>

                    <Button
                        className="flex items-center gap-2 px-4 h-9 rounded-lg bg-black text-white text-xs font-medium"
                    >
                        <Plus size={16} />
                        Add User
                    </Button>
                </div>
            }
            searchKeys={[
                "name",
                "email",
                "status",
                "location",
            ]}
            searchPlaceholder="Search users..."
            gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            renderGridCard={(user) => (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
                                {getInitials(user.name)}
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    {user.name}
                                </h3>

                                <p className="text-xs text-slate-500">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <DotMenu
                            onEdit={() => handleEdit(user)}
                            onDelete={() => handleDelete(user.id)}
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <span
                            className={`px-2 py-1 rounded-full text-[10px] font-medium ${user.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : user.status === "Suspended"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                        >
                            {user.status}
                        </span>

                        <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                            {user.plan}
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div>
                            <p className="font-semibold text-slate-900">
                                {user.bookings}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Bookings
                            </p>
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">
                                {user.totalSpent}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Total Spent
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-900">
                                {user.location}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Location
                            </p>
                        </div>
                    </div>
                </div>
            )}
        />
    );
}