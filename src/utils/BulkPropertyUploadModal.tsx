import { X } from "lucide-react";
import * as XLSX from "xlsx";
import type { DropdownItem } from "../utils/convertExcelDataToIds";

interface BulkPropertyUploadModalProps {
    open: boolean;
    onClose: () => void;
    excelFile: File | null;
    setExcelFile: (file: File | null) => void;
    previewData: Record<string, unknown>[];
    setPreviewData: (data: Record<string, unknown>[]) => void;
    propertyActions: DropdownItem[];
    propertyTypes: DropdownItem[];
    bhks: DropdownItem[];
    lifestyles: DropdownItem[];
    amenities: DropdownItem[];
    onUpload: (file: File) => void;
}

const BulkPropertyUploadModal = ({
    open,
    onClose,
    excelFile,
    setExcelFile,
    previewData,
    setPreviewData,
    onUpload,
}: BulkPropertyUploadModalProps) => {
    if (!open) {
        return null;
    }

    const handleExcelChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = [
            ".xlsx",
            ".xls",
            ".csv",
        ];

        const extension = `.${file.name
            .split(".")
            .pop()
            ?.toLowerCase()}`;

        if (!extension || !allowedTypes.includes(extension)) {
            setExcelFile(null);
            setPreviewData([]);
            return;
        }

        setExcelFile(file);

        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const result = event.target?.result;

                if (!result) {
                    setPreviewData([]);
                    return;
                }

                const workbook = XLSX.read(result, {
                    type: "binary",
                    cellDates: true,
                    cellNF: false,
                    cellText: false,
                });

                const sheetName = workbook.SheetNames[0];

                if (!sheetName) {
                    setPreviewData([]);
                    return;
                }

                const sheet = workbook.Sheets[sheetName];

                if (!sheet) {
                    setPreviewData([]);
                    return;
                }

                const data =
                    XLSX.utils.sheet_to_json<
                        Record<string, unknown>
                    >(sheet, {
                        defval: "",
                        raw: true,
                    });

                setPreviewData(data);
            } catch (error) {
                console.error("Excel read error:", error);
                setPreviewData([]);
            }
        };

        reader.readAsBinaryString(file);
    };

    const handleUploadClick = () => {
        if (!excelFile) {
            return;
        }

        if (!previewData.length) {
            return;
        }

        onUpload(excelFile);
    };

    const handleClose = () => {
        setExcelFile(null);
        setPreviewData([]);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
            <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
                <div className="flex items-center justify-between p-5">
                    <div>
                        <h2 className="text-2xl font-bold">
                            Bulk Property Upload
                        </h2>

                        <p className="text-sm text-gray-500">
                            Upload Excel file and preview properties before importing
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-black text-white"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="p-4">
                    <label className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-10 transition hover:bg-green-50">
                        <h3 className="text-lg font-semibold">
                            Upload Property Excel File
                        </h3>

                        <p className="text-gray-500">
                            Drag & Drop or Click to Browse
                        </p>

                        <p className="mt-2 text-xs text-gray-400">
                            Supported: .xlsx, .xls, .csv
                        </p>

                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            className="hidden"
                            onChange={handleExcelChange}
                        />
                    </label>

                    {excelFile && (
                        <div className="mt-3 rounded-lg bg-gray-50 p-3">
                            <p className="text-sm text-gray-600">
                                Selected file:
                            </p>

                            <p className="font-medium text-gray-900">
                                {excelFile.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                {(excelFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    )}
                </div>

                {previewData.length > 0 && (
                    <div className="px-6 pb-6">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="font-semibold">
                                Preview Data
                            </h3>

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                                {previewData.length} Properties
                            </span>
                        </div>

                        <div className="max-h-[350px] overflow-auto rounded-xl border scrollbar-hide">
                            <table className="w-full min-w-max text-sm">
                                <thead className="sticky top-0 z-10 bg-gray-100">
                                    <tr>
                                        {Object.keys(
                                            previewData[0],
                                        ).map((key) => (
                                            <th
                                                key={key}
                                                className="whitespace-nowrap border p-3 text-left font-semibold"
                                            >
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {previewData
                                        .slice(0, 20)
                                        .map((row, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gray-50"
                                            >
                                                {Object.keys(
                                                    previewData[0],
                                                ).map((key) => (
                                                    <td
                                                        key={key}
                                                        className="whitespace-nowrap border p-3"
                                                    >
                                                        {String(
                                                            row[key] ?? "",
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>

                        {previewData.length > 20 && (
                            <p className="mt-2 text-xs text-gray-500">
                                Showing first 20 of{" "}
                                {previewData.length} properties.
                            </p>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 p-6">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="cursor-pointer rounded-xl border px-6 py-3 text-sm"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleUploadClick}
                        disabled={
                            !excelFile ||
                            !previewData.length
                        }
                        className="cursor-pointer rounded-xl bg-green-600 px-6 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Upload Properties
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BulkPropertyUploadModal;