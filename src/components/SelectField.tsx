import React, {
    useEffect,
    useRef,
    useState,
} from "react";
import {
    ChevronDown,
    Search,
    X,
} from "lucide-react";

export interface Option {
    label: string;
    value: string | number;
    isCreateOption?: boolean;
}

interface SelectFieldProps {
    name?: string;
    value?: string | number | (string | number)[];
    options: Option[];
    placeholder?: string;
    searchable?: boolean;
    multiple?: boolean;
    showLabel?: boolean;
    className?: string;
    onChange?: (
        value: string | number | (string | number)[]
    ) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
    name,
    value = "",
    options,
    placeholder = "Select an option",
    searchable = false,
    multiple = false,
    showLabel = true,
    className = "",
    onChange,
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOptions = options.filter((option) => {
        if (Array.isArray(value)) {
            return value.some(
                (item) =>
                    String(item) === String(option.value)
            );
        }

        return (
            String(value) === String(option.value)
        );
    });

    const filteredOptions = [
        ...options.filter(
            (option) =>
                option.isCreateOption &&
                option.label
                    .toLowerCase()
                    .includes(search.toLowerCase())
        ),

        ...options.filter(
            (option) =>
                !option.isCreateOption &&
                option.label
                    .toLowerCase()
                    .includes(search.toLowerCase())
        ),
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false);
                setSearch("");
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const isSelected = (
        optionValue: string | number
    ) => {
        if (Array.isArray(value)) {
            return value.some(
                (item) =>
                    String(item) ===
                    String(optionValue)
            );
        }

        return (
            String(value) ===
            String(optionValue)
        );
    };

    const handleSelect = (
        optionValue: string | number
    ) => {
        const selectedOption = options.find(o => o.value === optionValue);

        if (selectedOption?.isCreateOption) {
            onChange?.(optionValue);
            return;
        }

        if (multiple) {
            const currentValues = Array.isArray(value)
                ? value
                : [];

            const exists = currentValues.some(
                (item) =>
                    String(item) ===
                    String(optionValue)
            );

            const newValues = exists
                ? currentValues.filter(
                    (item) =>
                        String(item) !==
                        String(optionValue)
                )
                : [
                    ...currentValues,
                    optionValue,
                ];

            onChange?.(newValues);
            return;
        }

        onChange?.(optionValue);
        setOpen(false);
        setSearch("");
    };

    const handleClear = (
        event: React.MouseEvent
    ) => {
        event.stopPropagation();

        if (multiple) {
            onChange?.([]);
        } else {
            onChange?.("");
        }

        setSearch("");
    };

    return (
        <div
            className="w-full"
            ref={dropdownRef}
        >
            {showLabel && name && (
                <label className="block mb-1.5 text-sm font-medium text-slate-700 capitalize">
                    {name.replace(
                        /([A-Z])/g,
                        " $1"
                    )}
                </label>
            )}

            <div className="relative">
                <div
                    onClick={() =>
                        setOpen((prev) => !prev)
                    }
                    className={`flex items-center justify-between w-full min-h-[40px] rounded-sm border border-gray-300 bg-white px-3 py-2 cursor-pointer ${className}`}
                >
                    <div className="flex flex-1 flex-wrap gap-1">
                        {multiple ? (
                            selectedOptions.length > 0 ? (
                                selectedOptions.map(
                                    (option) => (
                                        <span
                                            key={
                                                option.value
                                            }
                                            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                                        >
                                            {
                                                option.label
                                            }

                                            <button
                                                type="button"
                                                onClick={(
                                                    event
                                                ) => {
                                                    event.stopPropagation();

                                                    handleSelect(
                                                        option.value
                                                    );
                                                }}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X
                                                    size={12}
                                                />
                                            </button>
                                        </span>
                                    )
                                )
                            ) : (
                                <span className="text-gray-400">
                                    {placeholder}
                                </span>
                            )
                        ) : (
                            <span
                                className={
                                    selectedOptions.length
                                        ? "text-gray-900"
                                        : "text-gray-400"
                                }
                            >
                                {selectedOptions[0]
                                    ?.label ??
                                    placeholder}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        {selectedOptions.length > 0 && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-gray-400 hover:text-red-500"
                            >
                                <X size={16} />
                            </button>
                        )}

                        <ChevronDown
                            size={18}
                            className={`transition-transform ${open
                                ? "rotate-180"
                                : ""
                                }`}
                        />
                    </div>
                </div>

                {open && (
                    <div className="absolute left-0 z-50 mt-1 max-h-72 w-full overflow-auto rounded-sm border border-gray-300 bg-white shadow-lg">
                        {searchable && (
                            <div className="flex items-center gap-2 border-b border-gray-300 p-2">
                                <Search
                                    size={16}
                                    className="text-gray-400"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    onClick={(event) =>
                                        event.stopPropagation()
                                    }
                                    placeholder="Search..."
                                    className="w-full text-sm outline-none"
                                />
                            </div>
                        )}

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(
                                (option) => {
                                    const selected =
                                        isSelected(
                                            option.value
                                        );

                                    return (
                                        <div
                                            key={
                                                option.value
                                            }
                                            onClick={() =>
                                                handleSelect(
                                                    option.value
                                                )
                                            }
                                            className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 ${selected
                                                ? "bg-gray-100 font-medium"
                                                : ""
                                                } ${option.isCreateOption
                                                    ? "border-t border-gray-200 text-blue-600 font-medium hover:bg-blue-50"
                                                    : ""
                                                }`}
                                        >
                                            {multiple && (
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selected
                                                    }
                                                    readOnly
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                            )}

                                            <span>
                                                {
                                                    option.label
                                                }
                                            </span>
                                        </div>
                                    );
                                }
                            )
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