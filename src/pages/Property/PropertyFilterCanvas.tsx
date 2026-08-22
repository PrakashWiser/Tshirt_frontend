import { useState, useEffect } from 'react';
import { X, Filter, SlidersHorizontal, RotateCcw, Check, Home, Star, Sparkles } from 'lucide-react';
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
        filters.minPrice || filterOptions?.min_price || 0,
        filters.maxPrice || filterOptions?.max_price || 10000000,
    ]);

    useEffect(() => {
        setLocalFilters(filters);
        setPriceRange([
            filters.minPrice || filterOptions?.min_price || 0,
            filters.maxPrice || filterOptions?.max_price || 10000000,
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

    const handleApply = () => {
        onApplyFilters(localFilters);
        onClose();
    };

    const handleClear = () => {
        setLocalFilters({});
        setPriceRange([
            filterOptions?.min_price || 0,
            filterOptions?.max_price || 10000000,
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
        if (localFilters.minPrice) count++;
        if (localFilters.maxPrice) count++;
        if (localFilters.minSquareFeet) count++;
        if (localFilters.maxSquareFeet) count++;
        if (localFilters.status) count++;
        if (localFilters.verification) count++;
        if (localFilters.recommended) count++;
        if (localFilters.highlighted) count++;
        if (localFilters.featured) count++;
        if (localFilters.furnished) count++;
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
                            <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                            Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFilterChange('status', localFilters.status ? '' : undefined)}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${!localFilters.status
                                    ? 'border-slate-300 bg-slate-100 text-slate-700'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilterChange('status', localFilters.status === 'Active' ? '' : 'Active')}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.status === 'Active'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => handleFilterChange('status', localFilters.status === 'Inactive' ? '' : 'Inactive')}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.status === 'Inactive'
                                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                Inactive
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                            Verification Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFilterChange('verification', localFilters.verification ? '' : undefined)}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${!localFilters.verification
                                    ? 'border-slate-300 bg-slate-100 text-slate-700'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilterChange('verification', localFilters.verification === 'Verified' ? '' : 'Verified')}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.verification === 'Verified'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                Verified
                            </button>
                            <button
                                onClick={() => handleFilterChange('verification', localFilters.verification === 'Pending' ? '' : 'Pending')}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.verification === 'Pending'
                                    ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => handleFilterChange('verification', localFilters.verification === 'Rejected' ? '' : 'Rejected')}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.verification === 'Rejected'
                                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>

                    {/* Furnished Filter */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-rose-500 rounded-full"></span>
                            Furnished
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleFilterChange('furnished', localFilters.furnished ? '' : undefined)}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${!localFilters.furnished
                                    ? 'border-slate-300 bg-slate-100 text-slate-700'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilterChange('furnished', localFilters.furnished === 'furnished' ? '' : 'furnished')}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.furnished === 'furnished'
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                Furnished
                            </button>
                            <button
                                onClick={() => handleFilterChange('furnished', localFilters.furnished === 'semi_furnished' ? '' : 'semi_furnished')}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.furnished === 'semi_furnished'
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                Semi-Furnished
                            </button>
                            <button
                                onClick={() => handleFilterChange('furnished', localFilters.furnished === 'unfurnished' ? '' : 'unfurnished')}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.furnished === 'unfurnished'
                                    ? 'border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                Unfurnished
                            </button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Property Highlights</label>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handleFilterChange('recommended', localFilters.recommended ? false : true)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.recommended
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <Star size={16} />
                                Recommended
                                {localFilters.recommended && <Check size={16} />}
                            </button>
                            <button
                                onClick={() => handleFilterChange('highlighted', localFilters.highlighted ? false : true)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.highlighted
                                    ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <Sparkles size={16} />
                                Highlighted
                                {localFilters.highlighted && <Check size={16} />}
                            </button>
                            <button
                                onClick={() => handleFilterChange('featured', localFilters.featured ? false : true)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.featured
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <Home size={16} />
                                Featured
                                {localFilters.featured && <Check size={16} />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                            Property Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {filterOptions?.propertyType?.map((type) => (
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

                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
                            BHK
                        </label>

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => handleFilterChange("bhk", undefined)}
                                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${!localFilters.bhk
                                        ? "border-slate-300 bg-slate-100 text-slate-700"
                                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                            >
                                All
                            </button>

                            {filterOptions?.bhk?.map((bhk) => (
                                <button
                                    type="button"
                                    key={bhk._id}
                                    onClick={() =>
                                        handleFilterChange(
                                            "bhk",
                                            localFilters.bhk === bhk._id
                                                ? undefined
                                                : bhk._id
                                        )
                                    }
                                    className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${localFilters.bhk === bhk._id
                                            ? "border-purple-500 bg-purple-50 text-purple-700 ring-2 ring-purple-200"
                                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                >
                                    {bhk.name}

                                    {localFilters.bhk === bhk._id && (
                                        <Check
                                            size={16}
                                            className="inline ml-2 text-purple-500"
                                        />
                                    )}
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
                                min={filterOptions?.min_price || 0}
                                max={filterOptions?.max_price || 10000000}
                                value={priceRange[0]}
                                onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <input
                                type="range"
                                min={filterOptions?.min_price || 0}
                                max={filterOptions?.max_price || 10000000}
                                value={priceRange[1]}
                                onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
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