import { useEffect, useMemo, useState } from "react";
import { Download, Phone, User, Mail, MessageSquare } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
  clearContactSupportError,
  deleteContactSupport,
  getAllContactSupports,
  updateContactSupportStatus,
  type ContactSupport,
  type ContactSupportStatus,
} from "../../store/slice/contactSupportSlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";

const STATUS_OPTIONS: {
  value: ContactSupportStatus;
  label: string;
}[] = [
  { value: "new", label: "New" },
  { value: "in progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "in progress":
      return "bg-yellow-100 text-yellow-700";
    case "resolved":
      return "bg-green-100 text-green-700";
    case "closed":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "new":
      return "New";
    case "in progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return status;
  }
};

interface ContactSupportTableRow {
  id: string;
  name: string;
  email: string;
  mobile: string;
  message: string;
  status: ContactSupportStatus;
  createdAt: string;
}

export default function ContactSupportList() {
  const dispatch = useAppDispatch();

  const { message, error, contactSupports, isLoading } = useAppSelector(
    (state) => state.contactSupport,
  );

  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(getAllContactSupports());
  }, [dispatch]);

  useEffect(() => {
    if (message) {
      dispatch(addToast({ type: "success", text: message }));
      dispatch(clearContactSupportError());
    }

    if (error) {
      dispatch(addToast({ type: "error", text: error }));
      dispatch(clearContactSupportError());
    }
  }, [message, error, dispatch]);

  const handleStatusChange = (id: string, newStatus: ContactSupportStatus) => {
    dispatch(
      updateContactSupportStatus({
        id,
        status: newStatus,
      }),
    );
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteId) return;

    dispatch(deleteContactSupport(deleteId));
    setDeleteModal(false);
    setDeleteId(null);
  };

  const filteredContacts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return contactSupports.filter((contact) => {
      const matchesSearch =
        !searchValue ||
        contact.name.toLowerCase().includes(searchValue) ||
        contact.email.toLowerCase().includes(searchValue) ||
        contact.mobile.includes(searchValue) ||
        contact.message.toLowerCase().includes(searchValue);

      const matchesStatus = !statusFilter || contact.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contactSupports, search, statusFilter]);

  const columns = useMemo<ColumnDef<ContactSupportTableRow>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        accessor: "name",
        render: (value) => (
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <span className="font-medium text-slate-900">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "email",
        header: "Email",
        accessor: "email",
        render: (value) => (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-slate-400" />
            <span className="text-sm text-slate-700">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "mobile",
        header: "Mobile Number",
        accessor: "mobile",
        render: (value) => (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-slate-400" />
            <span className="font-mono text-sm">{String(value)}</span>
          </div>
        ),
      },
      {
        key: "message",
        header: "Message",
        accessor: "message",
        render: (value) => (
          <div className="flex items-center gap-2 max-w-[300px]">
            <MessageSquare size={14} className="text-slate-400 shrink-0" />
            <span
              className="text-sm text-slate-700 truncate"
              title={String(value)}
            >
              {String(value)}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Status",
        accessor: "status",
        render: (value, row) => {
          const status = String(value) as ContactSupportStatus;

          return (
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  status,
                )}`}
              >
                {getStatusBadge(status)}
              </span>

              <select
                value={status}
                onChange={(e) =>
                  handleStatusChange(
                    row.id,
                    e.target.value as ContactSupportStatus,
                  )
                }
                className="text-xs border border-slate-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          );
        },
      },
      {
        key: "createdAt",
        header: "Created At",
        accessor: "createdAt",
        render: (value) => {
          const date = new Date(String(value));

          return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        },
      },
      {
        key: "actions",
        header: "Actions",
        accessor: "id",
        render: (_, row) => <DotMenu onDelete={() => handleDelete(row.id)} />,
      },
    ],
    [],
  );

  const tableData: ContactSupportTableRow[] = useMemo(
    () =>
      filteredContacts.map((contact: ContactSupport) => ({
        id: contact._id,
        name: contact.name,
        email: contact.email,
        mobile: contact.mobile,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt,
      })),
    [filteredContacts],
  );

  const handleExport = () => {
    const exportColumns = columns.filter((column) => column.key !== "actions");

    exportTableData(tableData as any, exportColumns, "Contact Support");
  };

  const newCount = contactSupports.filter(
    (item) => item.status === "new",
  ).length;

  const inProgressCount = contactSupports.filter(
    (item) => item.status === "in progress",
  ).length;

  const resolvedCount = contactSupports.filter(
    (item) => item.status === "resolved",
  ).length;

  return (
    <>
      <div className="space-y-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Contact Support
            </h1>

            <p className="text-sm text-slate-500 mt-1">
              Manage all contact support requests.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>

              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleExport}
              disabled={tableData.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-500">Total Requests</p>

            <p className="text-2xl font-bold text-slate-900">
              {contactSupports.length}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-500">New</p>

            <p className="text-2xl font-bold text-blue-600">{newCount}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-500">In Progress</p>

            <p className="text-2xl font-bold text-yellow-600">
              {inProgressCount}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-500">Resolved</p>

            <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
              </div>
            ) : (
              <DataTable
                data={tableData}
                columns={columns}
                rowKey="id"
                defaultView="table"
                searchKeys={["name", "email", "mobile", "message"]}
                searchPlaceholder="Search contact..."
              />
            )}
          </div>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal}
        title="Are you sure you want to delete this contact support request?"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModal(false);
          setDeleteId(null);
        }}
        loading={isLoading}
      />
    </>
  );
}
