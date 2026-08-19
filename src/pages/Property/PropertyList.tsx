import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Filter, MapPin, Square, Eye, Tag } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import CreateProperty from "./CreateProperty";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    clearPropertyError,
    deleteProperty,
    getAllProperties,
    getPropertyFilters,
    type Property,
    type PropertyFilters,
} from "../../store/slice/propertySlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";
import { useNavigate } from "react-router-dom";
import CustomImage from "../../components/Image";
import Button from "../../components/Button";
import PropertyFilterCanvas from "./PropertyFilterCanvas";

interface PropertyRow {
    id: string;
    name: string;
    propertyType: string;
    propertyAction: string;
    bhk: string;
    totalSquareFeet: number;
    totalPrice: string;
    location: string;
    image: string;
    isFeatured: boolean;
}

export default function PropertyList() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [openCreate, setOpenCreate] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<PropertyFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [showFilterCanvas, setShowFilterCanvas] = useState(false);

    const {
        properties,
        isLoading,
        error,
        message,
        pagination,
        filters: filterOptions
    } = useAppSelector((state) => state.property);

    useEffect(() => {
        dispatch(
            getAllProperties({
                page: currentPage,
                limit,
                filters,
            })
        );
        dispatch(getPropertyFilters());
    }, [dispatch, currentPage, limit, filters]);

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllProperties({ page: currentPage, limit, filters }));
            setOpenCreate(false);
            dispatch(clearPropertyError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearPropertyError());
        }
    }, [message, error, dispatch, currentPage, limit, filters]);

    const columns = useMemo<ColumnDef<PropertyRow>[]>(
        () => [
            {
                key: "image",
                header: "Image",
                accessor: "image",
                render: (value) => (
                    <CustomImage
                        src={String(value)}
                        alt="Property"
                        className="w-14 h-14 rounded-lg object-cover"
                    />
                ),
            },
            {
                key: "name",
                header: "Property Name",
                accessor: "name",
                render: (value, row) => (
                    <div>
                        <div className="font-medium text-slate-900">{String(value)}</div>
                        <div className="text-xs text-slate-400">ID: {row.id.substring(0, 8)}</div>
                    </div>
                ),
            },
            {
                key: "propertyType",
                header: "Type",
                accessor: "propertyType",
                render: (value) => (
                    <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {String(value)}
                    </span>
                ),
            },
            {
                key: "propertyAction",
                header: "Action",
                accessor: "propertyAction",
                render: (value) => (
                    <span className="text-sm bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        {String(value)}
                    </span>
                ),
            },
            {
                key: "bhk",
                header: "BHK",
                accessor: "bhk",
                render: (value) => (
                    <span className="font-medium">{String(value)}</span>
                ),
            },
            {
                key: "totalSquareFeet",
                header: "Area (sq.ft)",
                accessor: "totalSquareFeet",
                render: (value) => (
                    <span>{Number(value).toLocaleString()}</span>
                ),
            },
            {
                key: "price",
                header: "Price",
                accessor: "totalPrice",
                render: (value) => (
                    <span className="font-bold text-emerald-600">
                        {String(value)}
                    </span>
                ),
            },
            {
                key: "location",
                header: "Location",
                accessor: "location",
                render: (value) => (
                    <div className="flex items-center gap-1 text-sm">
                        <MapPin size={14} className="text-slate-400" />
                        {String(value)}
                    </div>
                ),
            },
            {
                key: "isFeatured",
                header: "Featured",
                accessor: "isFeatured",
                render: (value) => (
                    <span className={`text-xs font-medium ${value ? "text-amber-500" : "text-slate-400"}`}>
                        {value ? "★ Featured" : "—"}
                    </span>
                ),
            },
            {
                key: "actions",
                header: "Actions",
                accessor: "id",
                render: (_, row) => {
                    const property = properties.find((p) => p.id === row.id);
                    return (
                        <DotMenu
                            onView={() => handleView(row.id)}
                            onEdit={() => property && handleEdit(property)}
                            onDelete={() => handleDelete(row.id)}
                        />
                    );
                },
            },
        ],
        [properties]
    );

    const tableData: PropertyRow[] = useMemo(() => {
        return properties.map((property) => ({
            id: property.id,
            name: property.name,
            propertyType: typeof property.propertyType === "object"
                ? property.propertyType.name
                : "Unknown",
            propertyAction: typeof property.propertyAction === "object"
                ? property.propertyAction.name
                : "Unknown",
            bhk: `${property.bhk} BHK`,
            totalSquareFeet: property.totalSquareFeet,
            totalPrice: property.price || "N/A",
            location: property.location?.locality
                ? `${property.location.locality}, ${property.location.city || ""}`
                : property.location?.city || "N/A",
            image: property.image || "",
            isFeatured: property.isFeatured || false,
        }));
    }, [properties]);

    const handleView = (id: string) => {
        navigate(`/properties/${id}`);
    };

    const handleEdit = (property: Property) => {
        setSelectedProperty(property);
        setOpenCreate(true);
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        await dispatch(deleteProperty(deleteId));
        setDeleteModal(false);
        setDeleteId(null);
    };

    const handleExport = () => {
        const exportColumns = columns.filter(col => col.key !== 'actions' && col.key !== 'image');
        exportTableData(tableData as any, exportColumns, "Properties");
    };

    const handleApplyFilters = () => {
        setCurrentPage(1);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setFilters({});
        setCurrentPage(1);
        setShowFilters(false);
    };

    if (openCreate) {
        return (
            <CreateProperty
                selectedProperty={selectedProperty}
                onClose={() => {
                    setOpenCreate(false);
                    setSelectedProperty(null);
                }}
                loading={isLoading}
            />
        );
    }

    return (
        <>
            <div className="space-y-6 py-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            Properties
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage all properties, filter and export data.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <button
                            onClick={() => setShowFilterCanvas(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <Filter size={18} />
                            Filters
                            {Object.keys(filters).length > 0 && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors text-sm font-medium"
                            disabled={tableData.length === 0}
                        >
                            <Download size={18} />
                            Export
                        </button>
                        <Button onClick={() => setOpenCreate(true)}>
                            <Plus size={18} />
                            Add Property
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Total Properties</p>
                        <p className="text-2xl font-bold text-slate-900">
                            {pagination?.total || properties.length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Active</p>
                        <p className="text-2xl font-bold text-green-600">
                            {properties.filter(p => p.status === 1).length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Inactive</p>
                        <p className="text-2xl font-bold text-red-600">
                            {properties.filter(p => p.status !== 1).length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Featured</p>
                        <p className="text-2xl font-bold text-amber-500">
                            {properties.filter(p => p.isFeatured).length}
                        </p>
                    </div>
                </div>

                {showFilters && filterOptions && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-900">Filters</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleClearFilters}
                                    className="px-3 py-1 text-sm text-slate-600 hover:text-slate-900"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={handleApplyFilters}
                                    className="px-4 py-1 bg-black text-white rounded-lg text-sm"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm text-slate-600">Property Type</label>
                                <select
                                    value={filters.propertyType || ""}
                                    onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="">All Types</option>
                                    {filterOptions.propertyTypes.map((type) => (
                                        <option key={type._id} value={type._id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">Property Action</label>
                                <select
                                    value={filters.propertyAction || ""}
                                    onChange={(e) => setFilters({ ...filters, propertyAction: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="">All Actions</option>
                                    {filterOptions.propertyActions.map((action) => (
                                        <option key={action._id} value={action._id}>{action.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">BHK</label>
                                <select
                                    value={filters.bhk || ""}
                                    onChange={(e) => setFilters({ ...filters, bhk: Number(e.target.value) })}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="">All</option>
                                    {filterOptions.bhkOptions.map((bhk) => (
                                        <option key={bhk} value={bhk}>{bhk} BHK</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-sm text-slate-600">City</label>
                                <select
                                    value={filters.city || ""}
                                    onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                >
                                    <option value="">All Cities</option>
                                    {filterOptions.cities.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                            </div>
                        ) : (
                            <DataTable
                                data={tableData}
                                columns={columns}
                                rowKey="id"
                                defaultView="grid"
                                searchKeys={["name", "propertyType", "propertyAction", "location"]}
                                searchPlaceholder="Search properties..."
                                paginationMode="server"
                                pagination={{
                                    currentPage: pagination?.page || 1,
                                    totalPages: pagination?.totalPages || 1,
                                    total: pagination?.total || 0,
                                    limit: pagination?.limit || 10,
                                    onPageChange: (page) => {
                                        setCurrentPage(page);
                                    },
                                    onLimitChange: (limit) => {
                                        setLimit(limit);
                                        setCurrentPage(1);
                                    },
                                    pageSizeOptions: [10, 20, 50, 100],
                                }}
                                gridClassName="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                                renderGridCard={(row: PropertyRow) => {
                                    const originalProperty = properties.find((p) => p.id === row.id);
                                    return (
                                        <div
                                            key={row.id}
                                            className="overflow-hidden cursor-pointer bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                            <div className="relative h-48">
                                                <CustomImage
                                                    src={row.image}
                                                    alt={row.name}
                                                    className="h-full w-full object-cover transition-all duration-500 ease-in-out hover:scale-105"
                                                />
                                                <div className="absolute top-3 left-3 flex gap-2">
                                                    {row.isFeatured && (
                                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
                                                            <Tag size={12} />
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="absolute right-3 top-3">
                                                    <DotMenu
                                                        onView={() => handleView(row.id)}
                                                        onEdit={() => originalProperty && handleEdit(originalProperty)}
                                                        onDelete={() => handleDelete(row.id)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-slate-900 line-clamp-1">
                                                            {row.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                                                {row.propertyType}
                                                            </span>
                                                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                                                                {row.propertyAction}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-emerald-600">
                                                            {row.totalPrice}
                                                        </p>
                                                        <p className="text-xs text-slate-500">{row.bhk}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-1">
                                                        <Square size={14} />
                                                        {row.totalSquareFeet} sq.ft
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {row.location}
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                                    <span>ID: {row.id.substring(0, 8)}</span>
                                                    <button
                                                        onClick={() => handleView(row.id)}
                                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        <Eye size={14} />
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>

            <PropertyFilterCanvas
                isOpen={showFilterCanvas}
                onClose={() => setShowFilterCanvas(false)}
                filters={filters}
                filterOptions={filterOptions}
                onApplyFilters={(newFilters) => {
                    setFilters(newFilters);
                    setCurrentPage(1);
                }}
                onClearFilters={() => {
                    setFilters({});
                    setCurrentPage(1);
                }}
                isLoading={isLoading}
            />

            <ConfirmDeleteModal
                isOpen={deleteModal}
                title="Are you sure you want to delete this property?"
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