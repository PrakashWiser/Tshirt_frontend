import { useState, useEffect } from 'react';
import { X, Filter, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';
import type { PropertyFilters, FilterOptions } from '../../store/slice/propertySlice';

interface PropertyFilterCanvasProps {
    isOpen: boolean;
    onClose: () => void;
    filters: PropertyFilters;
    filterOptions: FilterOptions | null;
    onApplyFilters: (filters: PropertyFilters) => void;
    onClearFilters: () => void;
    isLoading?: boolean;
}

export default function PropertyFilterCanvas({
    isOpen,
    onClose,
    filters,
    filterOptions,
    onApplyFilters,
    onClearFilters,
    isLoading = false,
}: PropertyFilterCanvasProps) {
    const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);
    const [priceRange, setPriceRange] = useState<[number, number]>([
        filters.minPrice || filterOptions?.priceRange?.min || 0,
        filters.maxPrice || filterOptions?.priceRange?.max || 10000000,
    ]);
    const [squareFeetRange, setSquareFeetRange] = useState<[number, number]>([
        filters.minSquareFeet || filterOptions?.squareFeetRange?.min || 0,
        filters.maxSquareFeet || filterOptions?.squareFeetRange?.max || 10000,
    ]);

    useEffect(() => {
        setLocalFilters(filters);
        setPriceRange([
            filters.minPrice || filterOptions?.priceRange?.min || 0,
            filters.maxPrice || filterOptions?.priceRange?.max || 10000000,
        ]);
        setSquareFeetRange([
            filters.minSquareFeet || filterOptions?.squareFeetRange?.min || 0,
            filters.maxSquareFeet || filterOptions?.squareFeetRange?.max || 10000,
        ]);
    }, [filters, filterOptions]);

    const handleFilterChange = (key: keyof PropertyFilters, value: any) => {
        setLocalFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handlePriceChange = (index: 0 | 1, value: number) => {
        const newRange: [number, number] = [...priceRange] as [number, number];
        newRange[index] = value;
        setPriceRange(newRange);
        if (index === 0) {
            setLocalFilters((prev) => ({ ...prev, minPrice: value }));
        } else {
            setLocalFilters((prev) => ({ ...prev, maxPrice: value }));
        }
    };

    const handleSquareFeetChange = (index: 0 | 1, value: number) => {
        const newRange: [number, number] = [...squareFeetRange] as [number, number];
        newRange[index] = value;
        setSquareFeetRange(newRange);
        if (index === 0) {
            setLocalFilters((prev) => ({ ...prev, minSquareFeet: value }));
        } else {
            setLocalFilters((prev) => ({ ...prev, maxSquareFeet: value }));
        }
    };

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleClear = () => {
        setLocalFilters({});
        setPriceRange([
            filterOptions?.priceRange?.min || 0,
            filterOptions?.priceRange?.max || 10000000,
        ]);
        setSquareFeetRange([
            filterOptions?.squareFeetRange?.min || 0,
            filterOptions?.squareFeetRange?.max || 10000,
        ]);
        onClearFilters();
        onClose();
    };

    const formatCurrency = (value: number) => {
        if (value >= 10000000) return `${(value / 10000000).toFixed(1)} Cr`;
        if (value >= 100000) return `${(value / 100000).toFixed(1)} L`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)} K`;
        return value.toString();
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (localFilters.propertyType) count++;
        if (localFilters.propertyAction) count++;
        if (localFilters.bhk) count++;
        if (localFilters.city) count++;
        if (localFilters.locality) count++;
        if (localFilters.minPrice) count++;
        if (localFilters.maxPrice) count++;
        if (localFilters.minSquareFeet) count++;
        if (localFilters.maxSquareFeet) count++;
        return count;
    };

    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-50 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            <div
                className={`fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 rounded-lg">
                            <SlidersHorizontal size={20} className="text-slate-700" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Filters</h2>
                            <p className="text-sm text-slate-500">
                                {getActiveFilterCount()} filters active
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <X size={24} className="text-slate-600" />
                    </button>
                </div>

                <div className="overflow-y-auto h-[calc(100vh-180px)] p-6 space-y-6">
                    {getActiveFilterCount() > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                            <span className="text-sm text-blue-700">
                                {getActiveFilterCount()} filters applied
                            </span>
                            <button
                                onClick={handleClear}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                                <RotateCcw size={14} />
                                Clear all
                            </button>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                            Property Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {filterOptions?.propertyTypes?.map((type) => (
                                <button
                                    key={type._id}
                                    onClick={() =>
                                        handleFilterChange(
                                            'propertyType',
                                            localFilters.propertyType === type._id ? '' : type._id
                                        )
                                    }
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 text-left ${localFilters.propertyType === type._id
                                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="flex items-center justify-between">
                                        {type.name}
                                        {localFilters.propertyType === type._id && (
                                            <Check size={16} className="text-blue-500" />
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-green-500 rounded-full"></span>
                            Property Action
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {filterOptions?.propertyActions?.map((action) => (
                                <button
                                    key={action._id}
                                    onClick={() =>
                                        handleFilterChange(
                                            'propertyAction',
                                            localFilters.propertyAction === action._id ? '' : action._id
                                        )
                                    }
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-200 text-left ${localFilters.propertyAction === action._id
                                        ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="flex items-center justify-between">
                                        {action.name}
                                        {localFilters.propertyAction === action._id && (
                                            <Check size={16} className="text-green-500" />
                                        )}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                            BHK
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFilterChange('bhk', localFilters.bhk ? '' : undefined)}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${!localFilters.bhk
                                    ? 'border-slate-300 bg-slate-100 text-slate-700'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                All
                            </button>
                            {filterOptions?.bhkOptions?.map((bhk) => (
                                <button
                                    key={bhk}
                                    onClick={() => handleFilterChange('bhk', localFilters.bhk === bhk ? '' : bhk)}
                                    className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.bhk === bhk
                                        ? 'border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    {bhk} BHK
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
                            Price Range
                        </label>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Min</label>
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Max</label>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>{formatCurrency(priceRange[0])}</span>
                                <span>{formatCurrency(priceRange[1])}</span>
                            </div>
                            <input
                                type="range"
                                min={filterOptions?.priceRange?.min || 0}
                                max={filterOptions?.priceRange?.max || 10000000}
                                value={priceRange[0]}
                                onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <input
                                type="range"
                                min={filterOptions?.priceRange?.min || 0}
                                max={filterOptions?.priceRange?.max || 10000000}
                                value={priceRange[1]}
                                onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                            Area (sq.ft)
                        </label>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Min</label>
                                    <input
                                        type="number"
                                        value={squareFeetRange[0]}
                                        onChange={(e) => handleSquareFeetChange(0, Number(e.target.value))}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500">Max</label>
                                    <input
                                        type="number"
                                        value={squareFeetRange[1]}
                                        onChange={(e) => handleSquareFeetChange(1, Number(e.target.value))}
                                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>{squareFeetRange[0]} sq.ft</span>
                                <span>{squareFeetRange[1]} sq.ft</span>
                            </div>
                            <input
                                type="range"
                                min={filterOptions?.squareFeetRange?.min || 0}
                                max={filterOptions?.squareFeetRange?.max || 10000}
                                value={squareFeetRange[0]}
                                onChange={(e) => handleSquareFeetChange(0, Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <input
                                type="range"
                                min={filterOptions?.squareFeetRange?.min || 0}
                                max={filterOptions?.squareFeetRange?.max || 10000}
                                value={squareFeetRange[1]}
                                onChange={(e) => handleSquareFeetChange(1, Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-rose-500 rounded-full"></span>
                            Location
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-slate-500">City</label>
                                <select
                                    value={localFilters.city || ''}
                                    onChange={(e) => handleFilterChange('city', e.target.value || '')}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Cities</option>
                                    {filterOptions?.cities?.map((city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500">Locality</label>
                                <select
                                    value={localFilters.locality || ''}
                                    onChange={(e) => handleFilterChange('locality', e.target.value || '')}
                                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Localities</option>
                                    {filterOptions?.localities?.map((locality) => (
                                        <option key={locality} value={locality}>
                                            {locality}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 bg-white">
                    <div className="flex gap-3">
                        <button
                            onClick={handleClear}
                            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700 flex items-center justify-center gap-2"
                        >
                            <RotateCcw size={18} />
                            Clear All
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={isLoading}
                            className="flex-[2] px-4 py-3 bg-black text-white rounded-xl hover:bg-black/90 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Applying...
                                </>
                            ) : (
                                <>
                                    <Filter size={18} />
                                    Apply Filters
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}