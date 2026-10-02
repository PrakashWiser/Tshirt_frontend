export type CategoryLevel = "legacy" | "parent" | "sub";

export interface CategoryReference {
  _id: string;
  name: string;
  slug: string;
  level?: CategoryLevel;
  isActive?: boolean;
  parentCategory?: string | CategoryReference | null;
}

export interface Category extends CategoryReference {
  description?: string;
  image?: string;
  imagePublicId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParentCategory extends Category {
  level: "parent";
  status: boolean;
}

export interface SubCategory extends Category {
  level: "sub";
  parentCategoryId: string;
  parentCategory?: CategoryReference | string | null;
  status: boolean;
}
