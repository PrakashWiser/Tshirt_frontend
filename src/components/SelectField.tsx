import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export interface Option {
    label: string;
    value: string | number;
}

interface SelectFieldProps {
    name?: string;
    value?: string | number;
    options: Option[];
    placeholder?: string;
    searchable?: boolean;
    showLabel?: boolean;
    className?: string;
    onChange?: (value: string | number) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
    name,
    value = "",
    options,
    placeholder = "Select an option",
    searchable = false,
    showLabel = true,
    className = "",
    onChange,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(
        (item) => String(item.value) === String(value)
    );

    const filteredOptions = options.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string | number) => {
        onChange?.(value);
        setOpen(false);
        setSearch("");
    };

    return (
        <div className="w-full" ref={dropdownRef}>
            {showLabel && name && (
                <label className="block mb-1.5 text-sm font-medium text-slate-700 capitalize">
                    {name.replace(/([A-Z])/g, " $1")}
                </label>
            )}

            <div className="relative">
                <div
                    onClick={() => setOpen((prev) => !prev)}
                    className={`flex items-center justify-between w-full rounded-sm border border-gray-300 bg-white px-3 py-2 cursor-pointer ${className}`}
                >
                    <span
                        className={
                            selectedOption
                                ? "text-gray-900"
                                : "text-gray-400"
                        }
                    >
                        {selectedOption?.label ?? placeholder}
                    </span>

                    <div className="flex items-center gap-2">
                        {selectedOption && (
                            <X
                                size={16}
                                className="cursor-pointer text-gray-400 hover:text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelect("");
                                }}
                            />
                        )}

                        <ChevronDown
                            size={18}
                            className={`transition-transform ${open ? "rotate-180" : ""
                                }`}
                        />
                    </div>
                </div>

                {open && (
                    <div className="absolute left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-sm border border-gray-300 bg-white shadow-lg">
                        {searchable && (
                            <div className="flex items-center gap-2 border-b border-gray-300 p-2">
                                <Search size={16} className="text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search..."
                                    className="w-full text-sm outline-none"
                                />
                            </div>
                        )}

                        {filteredOptions.length ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() =>
                                        handleSelect(option.value)
                                    }
                                    className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${String(option.value) === String(value)
                                        ? "bg-gray-100 font-medium"
                                        : ""
                                        }`}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : (
                            <div className="p-3 text-sm text-gray-400">
                                No results found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectField;