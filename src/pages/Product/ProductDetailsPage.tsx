import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../../components/Button";
import CustomImage from "../../components/Image";
import { FetchApi } from "../../api/Fetch";
import { useAppSelector, useAppDispatch } from "../../hooks/hooks";
import { addToast } from "../../store/slice/uiSlice";

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

const getCategoryName = (category?: string | CategoryOption) => {
  if (!category) return "Uncategorized";
  if (typeof category === "string") return category;
  return category.name || "Uncategorized";
};

const getVariantImages = (variant?: ProductVariant | null): string[] => {
  if (!variant) return [];
  return (variant.images || []).filter(
    (img) => typeof img === "string" && img.trim().length > 0,
  );
};

const getDiscountPercent = (price: number, salePrice?: number) => {
  if (!salePrice || salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
};

export default function ProductDetailsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { accessToken } = useAppSelector((state: any) => state.auth);

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchProduct = async () => {
    if (!accessToken || !slug) return;

    setLoading(true);
    try {
      const res: any = await FetchApi({
        endpoint: `/products/${slug}`,
        method: "GET",
        token: accessToken,
      });

      const data = res?.data ?? res;
      setProduct(data as ProductItem);
      setActiveVariantIndex(0);
      setActiveImageIndex(0);
    } catch (err: any) {
      dispatch(
        addToast({
          type: "error",
          text: err?.message || "Failed to load product",
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [accessToken, slug]);

  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    return product.variants[activeVariantIndex] || product.variants[0];
  }, [product, activeVariantIndex]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const variantImgs = getVariantImages(activeVariant);
    if (variantImgs.length > 0) return variantImgs;

    const allVariantImgs = (product.variants || []).flatMap((v) =>
      getVariantImages(v),
    );
    if (allVariantImgs.length > 0) return allVariantImgs;

    return (product.images || []).filter(Boolean);
  }, [product, activeVariant]);

  const activeImage = galleryImages[activeImageIndex] || "";

  const price = activeVariant?.price ?? 0;
  const salePrice = activeVariant?.salePrice ?? 0;
  const discount = getDiscountPercent(price, salePrice);
  const finalPrice = salePrice > 0 && salePrice < price ? salePrice : price;
  const inStock = (activeVariant?.stock ?? 0) > 0;

  const handleVariantChange = (index: number) => {
    setActiveVariantIndex(index);
    setActiveImageIndex(0);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#3A29AA] border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-slate-600">Product not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="overflow-hidden ">
            {activeImage ? (
              <CustomImage
                src={activeImage}
                alt={product.name}
                className="h-[420px] w-full object-contain rounded-2xl"
              />
            ) : (
              <div className="flex h-[420px] w-full items-center justify-center text-5xl font-bold text-[#3A29AA]">
                {product.name?.charAt(0)?.toUpperCase() || "P"}
              </div>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-3 justify-center">
              {galleryImages.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                  className={`overflow-hidden rounded-xl border ${
                    activeImageIndex === index
                      ? "border-[#3A29AA] ring-2 ring-[#3A29AA]/30"
                      : "border-slate-200"
                  }`}
                >
                  <CustomImage
                    src={img}
                    alt={`${product.name}-${index}`}
                    className="h-16 w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#3A29AA]">
              {getCategoryName(product.category)}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 md:text-3xl">
              {product.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.isFeatured && (
              <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-medium text-purple-700">
                Featured
              </span>
            )}
            {product.isBestSeller && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                Best Seller
              </span>
            )}
            {product.isNewArrival && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-medium text-blue-700">
                New Arrival
              </span>
            )}
            {product.isTrending && (
              <span className="rounded-full bg-pink-100 px-2.5 py-1 text-[11px] font-medium text-pink-700">
                Trending
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                product.isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-extrabold text-slate-900">
              ₹{finalPrice.toLocaleString("en-IN")}
            </span>
            {discount > 0 && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  ₹{price.toLocaleString("en-IN")}
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {discount}% OFF
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                inStock
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {inStock ? `In stock (${activeVariant?.stock})` : "Out of stock"}
            </span>
            {activeVariant?.sku && (
              <span className="text-xs text-slate-500">
                SKU: {activeVariant.sku}
              </span>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Variants</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant, index) => {
                const isActive = index === activeVariantIndex;
                return (
                  <button
                    key={variant._id || index}
                    type="button"
                    onClick={() => handleVariantChange(index)}
                    className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                      isActive
                        ? "border-[#3A29AA] bg-[#3A29AA] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {variant.color} / {variant.size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Variant details
            </h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-500">Color</p>
                <p className="font-medium text-slate-900">
                  {activeVariant?.color || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Size</p>
                <p className="font-medium text-slate-900">
                  {activeVariant?.size || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Price</p>
                <p className="font-medium text-slate-900">
                  ₹{(activeVariant?.price ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Sale price</p>
                <p className="font-medium text-slate-900">
                  ₹{(activeVariant?.salePrice ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Stock</p>
                <p className="font-medium text-slate-900">
                  {activeVariant?.stock ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">SKU</p>
                <p className="font-medium text-slate-900">
                  {activeVariant?.sku || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Status</p>
                <p className="font-medium text-slate-900">
                  {activeVariant?.isActive === false ? "Inactive" : "Active"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              All variants
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="py-2 pr-3 font-medium">Color</th>
                    <th className="py-2 pr-3 font-medium">Size</th>
                    <th className="py-2 pr-3 font-medium">SKU</th>
                    <th className="py-2 pr-3 font-medium">Price</th>
                    <th className="py-2 pr-3 font-medium">Sale</th>
                    <th className="py-2 pr-3 font-medium">Stock</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 font-medium">Images</th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants.map((variant, index) => (
                    <tr
                      key={variant._id || index}
                      className={`border-b border-slate-100 ${
                        index === activeVariantIndex ? "bg-slate-50" : ""
                      }`}
                    >
                      <td className="py-2 pr-3 text-slate-900">
                        {variant.color}
                      </td>
                      <td className="py-2 pr-3 text-slate-900">
                        {variant.size}
                      </td>
                      <td className="py-2 pr-3 text-slate-500">
                        {variant.sku}
                      </td>
                      <td className="py-2 pr-3 text-slate-900">
                        ₹{variant.price.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 pr-3 text-slate-900">
                        ₹{(variant.salePrice ?? 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2 pr-3 text-slate-900">
                        {variant.stock}
                      </td>
                      <td className="py-2 pr-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            variant.isActive === false
                              ? "bg-slate-100 text-slate-600"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {variant.isActive === false ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          {getVariantImages(variant)
                            .slice(0, 3)
                            .map((img, i) => (
                              <CustomImage
                                key={`${img}-${i}`}
                                src={img}
                                alt={`${variant.color}-${variant.size}-${i}`}
                                className="h-8 w-8 rounded border border-slate-200 object-cover"
                              />
                            ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {product.description && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">
                Description
              </h2>
              <p className="whitespace-pre-line text-sm text-slate-600">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
