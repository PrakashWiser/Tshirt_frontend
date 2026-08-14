import { useEffect, useMemo } from "react";
import { Download } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
// import DotMenu from "../../components/DotMenu";
import Button from "../../components/Button";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
    clearUsersError,
    getUsers,
} from "../../store/slice/usersSlice";
import type { User } from "../../store/slice/usersSlice";
import { addToast } from "../../store/slice/uiSlice";
import { exportTableData } from "../../utils/exportToExcel";
import CustomImage from "../../components/Image";

export default function UserSection() {
    const dispatch = useAppDispatch();

    const {
        users,
        isLoading,
        error,
        message,
    } = useAppSelector((state) => state.users);

    useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(clearUsersError());
        }

        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearUsersError());
        }
    }, [message, error, dispatch]);

    const columns = useMemo<ColumnDef<User>[]>(
        () => [
            {
                key: "firstName",
                header: "Name",
                accessor: "firstName",
                render: (_, row) => (
                    <span className="font-medium text-slate-900">
                        {[row.firstName, row.lastName]
                            .filter(Boolean)
                            .join(" ") || "Unknown User"}
                    </span>
                ),
            },
            {
                key: "email",
                header: "Email",
                accessor: "email",
                render: (value) => (
                    <span className="text-sm text-slate-600">
                        {String(value || "—")}
                    </span>
                ),
            },
            {
                key: "status",
                header: "Status",
                accessor: "status",
                render: (value) => (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${value === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                    >
                        {value === 1 ? "Active" : "Inactive"}
                    </span>
                ),
            },
            {
                key: "roles",
                header: "Role",
                accessor: "roles",
                render: (value) => (
                    <span className="text-sm text-slate-600">
                        {Array.isArray(value)
                            ? value.join(", ")
                            : "User"}
                    </span>
                ),
            },
        ],
        []
    );

    const getUserName = (user: User) => {
        const name = [user.firstName, user.lastName]
            .filter(Boolean)
            .join(" ")
            .trim();

        return name || "Unknown User";
    };

    const getInitials = (user: User) => {
        const name = getUserName(user);

        if (name === "Unknown User") {
            return "U";
        }

        return name
            .split(/\s+/)
            .map((item) => item.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleExport = () => {
        exportTableData(
            users,
            columns,
            "Users"
        );
    };

    return (
        <DataTable<User>
            data={users}
            columns={columns}
            rowKey="_id"
            defaultView="grid"
            pageSize={9}
            loading={isLoading}
            actions={
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 h-9 rounded-lg border border-slate-200 bg-white text-sm"
                    >
                        <Download size={16} />
                        Export
                    </Button>
                </div>
            }
            searchKeys={[
                "firstName",
                "lastName",
                "email",
                "mobile",
            ]}
            searchPlaceholder="Search users..."
            gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            renderGridCard={(user) => (
                <div
                    key={user._id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                    <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                            {user.profilePhoto ? (
                                <CustomImage
                                    src={user.profilePhoto}
                                    alt={getUserName(user)}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#3A29AA] text-white flex items-center justify-center text-sm font-semibold">
                                    {getInitials(user)}
                                </div>
                            )}

                            <div>
                                <h3 className="font-semibold text-slate-900 text-sm">
                                    {getUserName(user)}
                                </h3>

                                <p className="text-xs text-slate-500">
                                    {user.email || "No email"}
                                </p>
                            </div>
                        </div>

                        {/* <DotMenu
                            onEdit={() =>
                                console.log("Edit User", user)
                            }
                            onDelete={() =>
                                console.log("Delete User", user._id)
                            }
                        /> */}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <span
                            className={`px-2 py-1 rounded-full text-[10px] font-medium ${user.status === 1
                                    ? "bg-green-100 text-green-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                        >
                            {user.status === 1
                                ? "Active"
                                : "Inactive"}
                        </span>

                        <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">
                            {user.roles?.join(", ") || "User"}
                        </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div>
                            <p className="font-semibold text-slate-900">
                                {user.mobile || "—"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Mobile
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-900">
                                {user.favourites?.length || 0}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Favourites
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-900">
                                {user.isVerified
                                    ? "Verified"
                                    : "Not Verified"}
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Account
                            </p>
                        </div>
                    </div>
                </div>
            )}
        />
    );
}