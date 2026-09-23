    import { useEffect, useRef, useState } from "react";
    import { Plus, Download } from "lucide-react";
    import Button from "../../components/Button";
    import ConfirmDeleteModal from "../../components/ConfirmDeleteModal";
    import { FetchApi } from "../../api/Fetch";
    import { useAppSelector, useAppDispatch } from "../../hooks/hooks";
    import { addToast } from "../../store/slice/uiSlice";
    import CustomImage from "../../components/Image";
    import DotMenu from "../../components/DotMenu";
    import { exportTableData } from "../../utils/exportToExcel";
    import { DataTable } from "../../components/Table";
    import type { ColumnDef } from "../../components/TableTypes";
    import ReusableForm, {
    type FormField,
    type MediaValue,
    } from "../../components/ReusableForm";
    import { generateSku } from "../../utils/generateSku";

    type CategoryOption = {
    _id: string;
    name: string;
    slug?: string;
    };

    type ProductVariant = {
    _id?: string;
    color: string;
    size: string;
    price: number;
    salePrice?: number;
    sku: string;
    stock: number;
    images?: string[];
    isActive?: boolean;
    };

    type ProductItem = {
    _id: string;
    name: string;
    slug?: string;
    description?: string;
    category?: string | CategoryOption;
    images?: string[];
    variants: ProductVariant[];
    rating?: number;
    reviewCount?: number;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isTrending?: boolean;
    isActive?: boolean;
    };

    type ProductVariantForm = {
    color: string;
    size: string;
    price: string;
    salePrice: string;
    sku: string;
    stock: string;
    images: string[];
    isActive: boolean;
    };

    const emptyVariant = (): ProductVariantForm => ({
    color: "",
    size: "",
    price: "",
    salePrice: "",
    sku: "",
    stock: "",
    images: [],
    isActive: true,
    });

    const makeSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

    export default function ProductPage() {
    const dispatch = useAppDispatch();
    const { accessToken } = useAppSelector((state: any) => state.auth);

    const [products, setProducts] = useState<ProductItem[]>([]);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [removedImages, setRemovedImages] = useState<string[]>([]);

    const formValuesRef = useRef<Record<string, any>>({});

    const uploadImageToServer = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await FetchApi<{
        success: boolean;
        data?: { imageUrl?: string };
        }>({
        endpoint: "/upload",
        method: "POST",
        body: formData,
        token: accessToken ?? "",
        });

        const uploadedUrl = response?.data?.imageUrl || "";
        if (!uploadedUrl) throw new Error("Image upload failed");
        return uploadedUrl;
    };

    const fetchCategories = async () => {
        if (!accessToken) return;
        try {
        const res: any = await FetchApi({
            endpoint: "/categories",
            method: "GET",
            token: accessToken,
        });
        const items = Array.isArray(res?.data)
            ? res.data
            : (res?.categories ?? []);
        setCategories(items as CategoryOption[]);
        } catch {
        setCategories([]);
        }
    };

    const fetchProducts = async () => {
        if (!accessToken) return;
        setLoading(true);
        try {
        const res: any = await FetchApi({
            endpoint: "/products",
            method: "GET",
            token: accessToken,
        });
        const items = Array.isArray(res?.data) ? res.data : (res?.data?.products ?? []);
        setProducts(items as ProductItem[]);
        } catch (err: any) {
        dispatch(
            addToast({
            type: "error",
            text: err?.message || "Failed to load products",
            }),
        );
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [accessToken]);

    const openCreate = () => {
        setEditingId(null);
        setRemovedImages([]);
        formValuesRef.current = {};
        setIsFormOpen(true);
    };

    const openEdit = (product: ProductItem) => {
        setEditingId(product._id);
        setRemovedImages([]);
        formValuesRef.current = {};
        setIsFormOpen(true);
    };

    const getInitialValues = (product?: ProductItem | null) => {
        if (!product) {
        return {
            name: "",
            description: "",
            category: "",
            images: [],
            variants: [emptyVariant()],
            isFeatured: false,
            isBestSeller: false,
            isNewArrival: false,
            isTrending: false,
            isActive: true,
        };
        }

        const variants =
        product.variants?.length > 0
            ? product.variants.map((variant) => ({
                color: variant.color || "",
                size: variant.size || "",
                price: String(variant.price ?? ""),
                salePrice: String(variant.salePrice ?? ""),
                sku: variant.sku || "",
                stock: String(variant.stock ?? ""),
                images: Array.isArray(variant.images) ? variant.images : [],
                isActive: variant.isActive ?? true,
            }))
            : [emptyVariant()];

        const images: MediaValue[] = (product.images || []).map((url) => ({
        url,
        isExisting: true,
        }));

        return {
        name: product.name || "",
        description: product.description || "",
        category:
            typeof product.category === "string"
            ? product.category
            : product.category?._id || "",
        images,
        variants,
        isFeatured: product.isFeatured ?? false,
        isBestSeller: product.isBestSeller ?? false,
        isNewArrival: product.isNewArrival ?? false,
        isTrending: product.isTrending ?? false,
        isActive: product.isActive ?? true,
        };
    };

    const editingProduct = editingId
        ? products.find((p) => p._id === editingId) || null
        : null;

    const collectExistingSkus = (): string[] => {
        return products.flatMap((p) =>
        (p.variants || []).map((v) => String(v.sku || "").toUpperCase()),
        );
    };

    const buildAutoSku = (
        name: string,
        color: string,
        size: string,
        variants: ProductVariantForm[],
        selfIndex: number,
    ): string => {
        const used = collectExistingSkus().concat(
        variants
            .filter((_, i) => i !== selfIndex)
            .map((v) => String(v.sku || "").toUpperCase())
            .filter(Boolean),
        );
        return generateSku(name, color, size, used);
    };

    const applyAutoSkuToVariant = (
        values: Record<string, any>,
        index: number,
    ): Record<string, any> => {
        const variants: ProductVariantForm[] = Array.isArray(values.variants)
        ? values.variants
        : [];
        const target = variants[index];
        if (!target) return values;

        const color = String(target.color || "").trim();
        const size = String(target.size || "").trim();
        if (!color || !size) return values;

        const currentSku = String(target.sku || "").trim();

        if (currentSku && !currentSku.startsWith("AUTO:")) {
        return values;
        }

        const auto = buildAutoSku(
        String(values.name || "").trim(),
        color,
        size,
        variants,
        index,
        );

        const nextVariants = variants.map((v, i) =>
        i === index ? { ...v, sku: auto } : v,
        );

        return { ...values, variants: nextVariants };
    };

    const handleFieldChange = (name: string, value: any) => {
        if (name === "variants") {
        const variants: ProductVariantForm[] = Array.isArray(value) ? value : [];
        let updated: Record<string, any> = { ...formValuesRef.current, variants };

        variants.forEach((_, i) => {
            updated = applyAutoSkuToVariant(updated, i);
        });

        formValuesRef.current = updated;
        return;
        }

        const updated = { ...formValuesRef.current, [name]: value };
        formValuesRef.current = updated;

        if (name === "name") {
        const variants: ProductVariantForm[] = Array.isArray(updated.variants)
            ? updated.variants
            : [];
        variants.forEach((_, i) => {
            const res = applyAutoSkuToVariant(updated, i);
            Object.assign(updated, res);
        });
        formValuesRef.current = updated;
        }
    };

    const fields: FormField[] = [
        {
        name: "name",
        label: "Product Name",
        type: "text",
        placeholder: "Premium T-Shirt",
        required: true,
        fullWidth: true,
        },
        {
        name: "description",
        label: "Description",
        type: "textarea",
        placeholder: "Product description",
        fullWidth: true,
        },
        {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        placeholder: "Select category",
        options: categories.map((c) => ({
            label: c.name,
            value: c._id,
        })),
        },
        {
        name: "isActive",
        label: "Active",
        type: "checkbox",
        },
        {
        name: "images",
        label: "Product Images",
        type: "file",
        multiple: true,
        fullWidth: true,
        onUpload: async (file) => {
            if (!file) return "";
            try {
            return await uploadImageToServer(file);
            } catch (err: any) {
            dispatch(
                addToast({
                type: "error",
                text: err?.message || "Image upload failed",
                }),
            );
            return "";
            }
        },
        onMediaDelete: (_type, id) => {
            if (!id) return;
            setRemovedImages((prev) => (prev.includes(id) ? prev : [...prev, id]));
        },
        },
        {
        name: "variants",
        label: "Product Variants",
        type: "repeatable-group",
        fullWidth: true,
        placeholder:
            "Each color and size can have different price, stock and SKU",
        addLabel: "Add Variant",
        emptyItem: emptyVariant,
        subFields: [
            {
            name: "color",
            label: "Color",
            type: "text",
            placeholder: "Black",
            },
            {
            name: "size",
            label: "Size",
            type: "text",
            placeholder: "M",
            },
            {
            name: "price",
            label: "Price",
            type: "number",
            placeholder: "499",
            },
            {
            name: "salePrice",
            label: "Sale Price",
            type: "number",
            placeholder: "449",
            },
            {
            name: "stock",
            label: "Stock",
            type: "number",
            placeholder: "10",
            },
            {
            name: "isActive",
            label: "Variant Active",
            type: "checkbox",
            },
            {
            name: "images",
            label: "Variant Image (Optional)",
            type: "file",
            multiple: true,
            colSpan: 4,
            accept: "image/*",
            },
        ],
        onItemImageUpload: async (_index, file) => {
            if (!file) return "";
            try {
            return await uploadImageToServer(file);
            } catch (err: any) {
            dispatch(
                addToast({
                type: "error",
                text: err?.message || "Variant image upload failed",
                }),
            );
            return "";
            }
        },
        },
        {
        name: "flags",
        label: "Product Flags",
        type: "checkbox-group",
        fullWidth: true,
        checkboxOptions: [
            { name: "isFeatured", label: "Featured" },
            { name: "isBestSeller", label: "Best Seller" },
            { name: "isNewArrival", label: "New Arrival" },
            { name: "isTrending", label: "Trending" },
        ],
        },
    ];

    const validate = (values: Record<string, any>): string | null => {
        const variants = values.variants || [];

        if (!values.name?.trim()) return "Product name is required";
        if (!values.category) return "Please select a category";
        if (!variants.length) return "At least one variant is required";

        const skuSet = new Set<string>();
        const combinationSet = new Set<string>();

        for (let i = 0; i < variants.length; i++) {
        const v = variants[i];

        if (!v.color?.trim()) return `Variant ${i + 1}: Color is required`;
        if (!v.size?.trim()) return `Variant ${i + 1}: Size is required`;
        if (!v.price || Number(v.price) < 0)
            return `Variant ${i + 1}: Valid price is required`;
        if (v.salePrice && Number(v.salePrice) > Number(v.price))
            return `Variant ${i + 1}: Sale price cannot be greater than price`;
        if (v.stock === "" || Number(v.stock) < 0)
            return `Variant ${i + 1}: Valid stock is required`;

        const autoSku = buildAutoSku(
            String(values.name || "").trim(),
            String(v.color || "").trim(),
            String(v.size || "").trim(),
            variants,
            i,
        );

        const sku =
            String(v.sku || "")
            .trim()
            .toUpperCase() || autoSku;

        if (skuSet.has(sku)) return `Duplicate SKU: ${sku}`;
        skuSet.add(sku);

        const combo = `${v.color
            .trim()
            .toLowerCase()}::${v.size.trim().toLowerCase()}`;
        if (combinationSet.has(combo))
            return `Duplicate variant: ${v.color} / ${v.size}`;
        combinationSet.add(combo);
        }

        return null;
    };

    const handleSubmit = async (values: Record<string, any>) => {
        const error = validate(values);
        if (error) {
        dispatch(addToast({ type: "error", text: error }));
        return;
        }

        const rawImages: any[] = Array.isArray(values.images) ? values.images : [];

        const images: string[] = rawImages
        .map((item) => {
            if (typeof item === "string") return item;
            if (item && typeof item === "object" && "url" in item) return item.url;
            return "";
        })
        .filter(Boolean);

        const finalVariants = (values.variants || []).map((v: any, i: number) => {
        const autoSku = buildAutoSku(
            String(values.name || "").trim(),
            String(v.color || "").trim(),
            String(v.size || "").trim(),
            values.variants,
            i,
        );

        const sku =
            String(v.sku || "")
            .trim()
            .toUpperCase() || autoSku;

        return {
            color: String(v.color || "").trim(),
            size: String(v.size || "").trim(),
            price: Number(v.price || 0),
            salePrice: Number(v.salePrice || 0),
            sku,
            stock: Number(v.stock || 0),
            images: Array.isArray(v.images) ? v.images : [],
            isActive: Boolean(v.isActive),
        };
        });

        const payload = {
        name: values.name.trim(),
        slug: makeSlug(values.name),
        description: values.description?.trim() || "",
        category: values.category,
        images,
        variants: finalVariants,
        isFeatured: values.isFeatured,
        isBestSeller: values.isBestSeller,
        isNewArrival: values.isNewArrival,
        isTrending: values.isTrending,
        isActive: values.isActive,
        };

        setLoading(true);
        try {
        if (editingId) {
            await FetchApi({
            endpoint: `/products/${editingId}`,
            method: "PUT",
            token: accessToken,
            body: {
                ...payload,
                removedImages,
            },
            });
            dispatch(
            addToast({
                type: "success",
                text: "Product updated successfully",
            }),
            );
        } else {
            await FetchApi({
            endpoint: "/products",
            method: "POST",
            token: accessToken,
            body: payload,
            });
            dispatch(
            addToast({
                type: "success",
                text: "Product created successfully",
            }),
            );
        }

        setRemovedImages([]);
        setIsFormOpen(false);
        setEditingId(null);
        formValuesRef.current = {};
        await fetchProducts();
        } catch (err: any) {
        dispatch(
            addToast({
            type: "error",
            text: err?.message || "Unable to save product",
            }),
        );
        } finally {
        setLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        try {
        await FetchApi({
            endpoint: `/products/${deleteId}`,
            method: "DELETE",
            token: accessToken,
        });
        dispatch(
            addToast({
            type: "success",
            text: "Product deleted successfully",
            }),
        );
        setDeleteId(null);
        await fetchProducts();
        } catch (err: any) {
        dispatch(
            addToast({
            type: "error",
            text: err?.message || "Failed to delete product",
            }),
        );
        } finally {
        setLoading(false);
        }
    };

    const getLowestPrice = (product: ProductItem) => {
        if (!product.variants?.length) return 0;
        return Math.min(
        ...product.variants.map((v) => v.salePrice || v.price || 0),
        );
    };

    const getTotalStock = (product: ProductItem) =>
        product.variants?.reduce((total, v) => total + Number(v.stock || 0), 0) ||
        0;

    const getVariantCount = (product: ProductItem) =>
        product.variants?.length || 0;

    const handleExport = () => {
        exportTableData(
        products,
        [
            { key: "name", header: "Name", accessor: "name" },
            { key: "slug", header: "Slug", accessor: "slug" },
            {
            key: "category",
            header: "Category",
            accessor: (row: ProductItem) =>
                typeof row.category === "string"
                ? row.category
                : row.category?.name || "",
            },
            {
            key: "variants",
            header: "Variants",
            accessor: (row: ProductItem) => row.variants?.length || 0,
            },
            {
            key: "price",
            header: "Starting Price",
            accessor: (row: ProductItem) => getLowestPrice(row),
            },
            {
            key: "stock",
            header: "Total Stock",
            accessor: (row: ProductItem) => getTotalStock(row),
            },
            {
            key: "status",
            header: "Status",
            accessor: (row: ProductItem) =>
                row.isActive ? "Active" : "Inactive",
            },
        ],
        "Products",
        );
    };

    const columns: ColumnDef<ProductItem>[] = [
        {
        key: "image",
        header: "Image",
        accessor: (row) => row.images?.[0] || "",
        width: 90,
        render: (value, row) => {
            const image = String(value || "");
            if (image) {
            return (
                <CustomImage
                src={image}
                alt={row.name}
                className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                />
            );
            }
            return (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-[#3A29AA]">
                {row.name?.charAt(0)?.toUpperCase() || "P"}
            </div>
            );
        },
        },
        {
        key: "name",
        header: "Name",
        accessor: "name",
        sortable: true,
        render: (value, row) => (
            <div className="min-w-0">
            <p className="font-semibold text-slate-900">{String(value)}</p>
            <p className="text-xs text-slate-500">/{row.slug || "product"}</p>
            </div>
        ),
        },
        {
        key: "category",
        header: "Category",
        accessor: (row) =>
            typeof row.category === "string"
            ? row.category
            : row.category?.name || "No category",
        sortable: true,
        },
        {
        key: "variants",
        header: "Variants",
        accessor: (row) => getVariantCount(row),
        sortable: true,
        render: (value) => (
            <span className="text-slate-600">{String(value)} variants</span>
        ),
        },
        {
        key: "price",
        header: "Price",
        accessor: (row) => getLowestPrice(row),
        sortable: true,
        render: (value) => (
            <span className="font-medium text-slate-900">
            From ₹{Number(value || 0).toLocaleString("en-IN")}
            </span>
        ),
        },
        {
        key: "stock",
        header: "Stock",
        accessor: (row) => getTotalStock(row),
        sortable: true,
        render: (value) => (
            <span className="text-slate-600">{String(value)} in stock</span>
        ),
        },
        {
        key: "status",
        header: "Status",
        accessor: (row) => (row.isActive ? "Active" : "Inactive"),
        sortable: true,
        render: (value, row) => (
            <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                row.isActive
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
            >
            {String(value)}
            </span>
        ),
        },
        {
        key: "actions",
        header: "Actions",
        accessor: "_id",
        align: "right",
        render: (_, row) => (
            <div onClick={(e) => e.stopPropagation()}>
            <DotMenu
                onEdit={() => openEdit(row)}
                onDelete={() => setDeleteId(row._id)}
            />
            </div>
        ),
        },
    ];

    return (
        <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Products</h1>
            <p className="text-sm text-slate-500">
                Manage product catalog, variants and inventory
            </p>
            </div>

            {!isFormOpen && (
            <Button onClick={openCreate} className="flex items-center gap-2">
                <Plus size={16} />
                Add product
            </Button>
            )}
        </div>

        {isFormOpen && (
            <ReusableForm
            title={editingId ? "Edit product" : "Create product"}
            fields={fields}
            initialValues={getInitialValues(editingProduct)}
            submitText={editingId ? "Update product" : "Create product"}
            onClose={() => {
                setIsFormOpen(false);
                setEditingId(null);
                setRemovedImages([]);
                formValuesRef.current = {};
            }}
            loading={loading}
            onSubmit={handleSubmit}
            onFieldChange={handleFieldChange}
            resetKey={editingId ?? "new"}
            />
        )}

        {!isFormOpen && (
            <DataTable
            data={products}
            columns={columns}
            rowKey="_id"
            searchKeys={["name", "slug", "description"]}
            searchPlaceholder="Search products..."
            defaultView="grid"
            loading={loading}
            pageSize={10}
            pageSizeOptions={[10, 20, 50, 100]}
            paginationMode="client"
            actions={
                <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-sm"
                >
                <Download size={15} />
                Export
                </Button>
            }
            gridClassName="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            renderGridCard={(product: ProductItem) => {
                const image = product.images?.[0] || "";
                const lowestPrice = getLowestPrice(product);
                const totalStock = getTotalStock(product);
                const variantCount = getVariantCount(product);

                return (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        {image ? (
                        <CustomImage
                            src={image}
                            alt={product.name}
                            className="h-11 w-11 rounded-xl border border-slate-200 object-cover"
                        />
                        ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-lg font-bold text-[#3A29AA]">
                            {product.name?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                        )}

                        <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                            {product.name}
                        </h3>
                        <p className="truncate text-xs text-slate-500">
                            /{product.slug || "product"}
                        </p>
                        </div>
                    </div>

                    <div onClick={(e) => e.stopPropagation()}>
                        <DotMenu
                        onEdit={() => openEdit(product)}
                        onDelete={() => setDeleteId(product._id)}
                        />
                    </div>
                    </div>

                    <p className="line-clamp-2 text-sm text-slate-600">
                    {product.description || "No description added yet."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                    {product.variants?.slice(0, 5).map((variant, index) => (
                        <span
                        key={variant._id || index}
                        className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                        {variant.color} / {variant.size}
                        </span>
                    ))}

                    {variantCount > 5 && (
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-[#3A29AA]">
                        +{variantCount - 5} more
                        </span>
                    )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Price</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                        ₹{lowestPrice.toLocaleString("en-IN")}
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Variants</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                        {variantCount}
                        </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-[11px] text-slate-500">Stock</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                        {totalStock}
                        </p>
                    </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                        {product.isFeatured && (
                        <span className="rounded-full bg-purple-100 px-2 py-1 text-[10px] font-medium text-purple-700">
                            Featured
                        </span>
                        )}
                        {product.isBestSeller && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-medium text-amber-700">
                            Best Seller
                        </span>
                        )}
                        {product.isNewArrival && (
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-medium text-blue-700">
                            New
                        </span>
                        )}
                        {product.isTrending && (
                        <span className="rounded-full bg-pink-100 px-2 py-1 text-[10px] font-medium text-pink-700">
                            Trending
                        </span>
                        )}
                    </div>

                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                    >
                        {product.isActive ? "Active" : "Inactive"}
                    </span>
                    </div>
                </div>
                );
            }}
            />
        )}

        <ConfirmDeleteModal
            isOpen={Boolean(deleteId)}
            title="Delete this product?"
            loading={loading}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteId(null)}
        />
        </div>
    );
    }
