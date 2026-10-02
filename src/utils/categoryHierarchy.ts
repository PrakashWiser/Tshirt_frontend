import type { Category, SubCategory } from "../types/category";

export const getCategoryId = (
  parent: Category["parentCategory"],
): string => (typeof parent === "string" ? parent : parent?._id || "");

export const getCategoryPath = (category: Category | SubCategory): string => {
  const parentCategory =
    category.parentCategory && typeof category.parentCategory !== "string"
      ? category.parentCategory
      : null;

  return [parentCategory?.name, category.name]
    .filter(Boolean)
    .join(" / ");
};
