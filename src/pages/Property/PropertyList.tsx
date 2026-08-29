import { useEffect, useMemo, useState } from "react";
import { Download, Plus, Filter, MapPin, Square, Tag, Upload } from "lucide-react";
import { DataTable } from "../../components/Table";
import type { ColumnDef } from "../../components/TableTypes";
import CreateProperty from "./CreateProperty";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";
import {
    bulkUploadProperties,
    changePropertyVerification,
    clearPropertyError,
    deleteProperty,
    getAllProperties,
    getPropertyFilters,
    type Property,
    type PropertyFilters,
    type PropertyVerificationStatus,
} from "../../store/slice/propertySlice";
import DotMenu from "../../components/DotMenu";
import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
import { exportTableData } from "../../utils/exportToExcel";
import { useNavigate } from "react-router-dom";
import CustomImage from "../../components/Image";
import Button from "../../components/Button";
import PropertyFilterCanvas from "./PropertyFilterCanvas";
import BulkPropertyUploadModal from "../../utils/BulkPropertyUploadModal";
import { downloadPropertyDemoExcel } from "../../utils/propertyBulkExcel";
import { getAllPropertyActions } from "../../store/slice/propertyActionSlice";


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
    slug: string,
    status: string;
    isFeatured: boolean;
}

export default function PropertyList() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [openCreate, setOpenCreate] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [filters, setFilters] = useState<PropertyFilters>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [showFilterCanvas, setShowFilterCanvas] = useState(false);
    const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<
        Record<string, unknown>[]
    >([]);
    const {
        propertyActions,
    } = useAppSelector((state) => state.propertyAction);

    const {
        properties,
        isLoading,
        error,
        message,
        pagination,
        bulkUploadMessage, bulkUploadError,
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
        dispatch(getAllPropertyActions());
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

    useEffect(() => {
        if (bulkUploadMessage) {
            dispatch(
                addToast({
                    type: "success",
                    text: bulkUploadMessage,
                }),
            );

            dispatch(
                getAllProperties({
                    page: currentPage,
                    limit,
                    filters,
                }),
            );
            setBulkUploadOpen(false);
            setExcelFile(null);
            setPreviewData([]);
            dispatch(clearPropertyError());
        }

        if (bulkUploadError) {
            dispatch(
                addToast({
                    type: "error",
                    text: bulkUploadError,
                }),
            );

            dispatch(clearPropertyError());
        }
    }, [
        bulkUploadMessage,
        bulkUploadError,
        dispatch,
        currentPage,
        limit,
        filters,
    ]);



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
                key: "actions",
                header: "Actions",
                accessor: "id",
                render: (_, row) => {
                    const property = properties.find((p) => p.id === row.id);
                    return (
                        <DotMenu
                            onView={() => handleView(row.slug)}
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
            slug: property.slug,
            status: property.status || "Inactive",
        }));
    }, [properties]);

    const handleView = (slug: string) => {
        console.log(slug);
        
        navigate(`/properties/${slug}`);
    };

    const handleVerificationChange = async (
        id: string,
        verification: PropertyVerificationStatus,
    ) => {
        await dispatch(
            changePropertyVerification({
                id,
                verification: verification,
            }),
        );
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

    const handleDownloadDemo = () => {
        if (!filterOptions) {
            dispatch(
                addToast({
                    type: "error",
                    text: "Dropdown data is not loaded yet.",
                })
            );

            return;
        }

        downloadPropertyDemoExcel({
            propertyActions: propertyActions || [],
            propertyTypes: filterOptions.propertyType || [],
            bhks: filterOptions.bhk || [],
            lifestyles: filterOptions.lifeStyle || [],
            amenities: filterOptions.premiumAmenities || [],
        });
    };



    const handleBulkUpload = (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        for (const [key, value] of formData.entries()) {
            console.log(key, value);
        }
        dispatch(bulkUploadProperties(formData));
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
                    <div className="flex items-center gap-1 flex-wrap">

                        <button
                            onClick={() => setShowFilterCanvas(true)}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                            <Filter size={18} />
                            Filters
                            {Object.keys(filters).length > 0 && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-sm hover:bg-slate-50 transition-colors text-sm font-medium"
                            disabled={tableData.length === 0}
                        >
                            <Download size={18} />
                            Export
                        </button>
                        <Button
                            onClick={() => setBulkUploadOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <Upload size={18} />
                            Bulk Upload
                        </Button>

                        <Button
                            onClick={handleDownloadDemo}
                            className="flex items-center gap-2"
                        >
                            <Download size={18} />
                            Download Demo
                        </Button>

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
                            {properties.filter((p) => p.status === "Active").length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Inactive</p>
                        <p className="text-2xl font-bold text-red-600">
                            {properties.filter((p) => p.status === "Inactive").length}
                        </p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                        <p className="text-sm text-slate-500">Featured</p>
                        <p className="text-2xl font-bold text-amber-500">
                            {properties.filter(p => p.isFeatured).length}
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                                onSearchChange={(search) => {
                                    setFilters((prev) => ({
                                        ...prev,
                                        search: search.trim() || undefined,
                                    }));
                                    setCurrentPage(1);
                                }}
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
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "Active"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </div>
                                                <div className="absolute right-3 top-3">
                                                    <DotMenu
                                                        onView={() => handleView(row.slug)}
                                                        onEdit={() =>
                                                            originalProperty && handleEdit(originalProperty)
                                                        }
                                                        onDelete={() => handleDelete(row.id)}
                                                        verificationStatus={
                                                            originalProperty?.verification || "Pending"
                                                        }
                                                        onVerificationChange={(status) =>
                                                            handleVerificationChange(row.id, status)
                                                        }
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
                                                <div className="pt-3 flex items-center gap-1">
                                                    <p className="text-xs font-medium text-slate-500 mb-1">
                                                        Verification Status
                                                    </p>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs font-medium ${originalProperty?.verification === "Verified"
                                                            ? "bg-green-100 text-green-700"
                                                            : originalProperty?.verification === "Rejected"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-amber-100 text-amber-700"
                                                            }`}
                                                    >
                                                        {originalProperty?.verification === "Verified"
                                                            ? "Approved"
                                                            : originalProperty?.verification || "Pending"}
                                                    </span>
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
            <BulkPropertyUploadModal
                open={bulkUploadOpen}
                onClose={() => setBulkUploadOpen(false)}
                excelFile={excelFile}
                setExcelFile={setExcelFile}
                previewData={previewData}
                setPreviewData={setPreviewData}
                propertyActions={propertyActions || []}
                propertyTypes={filterOptions?.propertyType || []}
                bhks={filterOptions?.bhk || []}
                lifestyles={filterOptions?.lifeStyle || []}
                amenities={filterOptions?.premiumAmenities || []}
                onUpload={handleBulkUpload}
            />

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