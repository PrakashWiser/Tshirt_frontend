import type { ColumnDef } from "../components/Types";

type XLSXModule = typeof import("xlsx");

export async function exportTableData<T>(
  data: T[],
  columns: ColumnDef<T>[],
  fileName: string,
) {
  const xlsxModule = await import("xlsx");
  const XLSX = (xlsxModule as { default?: XLSXModule }).default ?? xlsxModule;

  const exportRows = data.map((row) => {
    const item: Record<string, unknown> = {};

    columns.forEach((column) => {
      let value: unknown = "";

      if (typeof column.accessor === "function") {
        value = column.accessor(row);
      } else if (typeof column.accessor === "string") {
        value = row[column.accessor as keyof T];
      }

      item[column.header] = value;
    });

    return item;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
