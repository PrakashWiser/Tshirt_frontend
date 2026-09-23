const clean = (v: string) =>
  String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const generateSku = (
  productName: string,
  color: string,
  size: string,
  existingSkus: string[] = [],
  seed?: string,
): string => {
  const namePart = clean(productName).split("-").slice(0, 2).join("-") || "PRD";
  const colorPart = clean(color).replace(/-/g, "").slice(0, 4) || "CLR";
  const sizePart = clean(size).replace(/-/g, "").slice(0, 4) || "SZ";

  let base = `${namePart}-${colorPart}-${sizePart}`;

  if (seed) {
    base = `${base}-${clean(seed).slice(0, 3)}`;
  }

  if (!existingSkus.length) return base;

  let sku = base;
  let counter = 1;
  while (existingSkus.includes(sku)) {
    sku = `${base}-${counter}`;
    counter += 1;
  }
  return sku;
};