export interface DropdownItem {
  _id?: string;
  name?: string;
}

export interface ConvertExcelOptions {
  propertyActions: DropdownItem[];
  propertyTypes: DropdownItem[];
  bhks: DropdownItem[];
  lifestyles: DropdownItem[];
  amenities: DropdownItem[];
}

const findIdByName = (value: unknown, options: DropdownItem[]): string => {
  if (value === null || value === undefined) {
    return "";
  }

  const name = String(value).trim().toLowerCase();

  if (!name) {
    return "";
  }

  const item = options.find(
    (option) =>
      typeof option.name === "string" &&
      option.name.trim().toLowerCase() === name,
  );

  return item?._id ?? "";
};

const findIdsByNames = (value: unknown, options: DropdownItem[]): string[] => {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        String(item)
          .split(",")
          .map((name) => name.trim())
          .filter(Boolean),
      )
      .map((name) => findIdByName(name, options))
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => findIdByName(item, options))
    .filter(Boolean);
};

export const convertExcelDataToIds = (
  rows: Record<string, unknown>[],
  options: ConvertExcelOptions,
): Record<string, unknown>[] => {
  return rows.map((row) => ({
    ...row,
    propertyType: findIdByName(row.propertyType, options.propertyTypes),
    propertyAction: findIdByName(row.propertyAction, options.propertyActions),
    bhk: findIdByName(row.bhk, options.bhks),
    lifestyles: findIdsByNames(row.lifestyles, options.lifestyles),
    premiumAmenities: findIdsByNames(row.premiumAmenities, options.amenities),
    isFeatured: String(row.isFeatured).toLowerCase() === "yes",
    isRecommended: String(row.isRecommended).toLowerCase() === "yes",
    isHighlighted: String(row.isHighlighted).toLowerCase() === "yes",
  }));
};
