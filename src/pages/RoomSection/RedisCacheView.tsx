import { useCallback, useMemo, useState } from "react";
import {
    BedDouble,
    ChevronDown,
    Check,
    Copy,
    Database,
    Search,
    Star,
} from "lucide-react";
import type { CachedRoom, RedisCacheData, RedisCacheEntry } from "../../types";

interface RedisCacheViewProps {
    cacheData: RedisCacheData | null;
    isLoading?: boolean;
}

const formatKeyLabel = (key: string): string =>
    key.replace(/^user:/, "").replaceAll(":", " • ");

export default function RedisCacheView({
    cacheData,
    isLoading = false,
}: RedisCacheViewProps) {
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
    const [rawViewKeys, setRawViewKeys] = useState<Set<string>>(new Set());
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredEntries = useMemo<RedisCacheEntry[]>(() => {
        const entries = cacheData?.cache ?? [];
        const term = searchTerm.trim().toLowerCase();
        if (!term) return entries;
        return entries.filter((entry) => entry.key.toLowerCase().includes(term));
    }, [cacheData, searchTerm]);

    const toggleExpanded = useCallback((key: string) => {
        setExpandedKeys((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    const toggleRawView = useCallback((key: string) => {
        setRawViewKeys((prev) => {
            const next = new Set(prev);
            next.has(key) ? next.delete(key) : next.add(key);
            return next;
        });
    }, []);

    const handleCopy = useCallback(async (key: string, payload: unknown) => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            setCopiedKey(key);
            setTimeout(() => {
                setCopiedKey((current) => (current === key ? null : current));
            }, 1500);
        } catch {
            setCopiedKey(null);
        }
    }, []);

    return (
        <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <Database size={20} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Redis Cache Viewer</h2>
                        <p className="text-xs text-slate-500">
                            {cacheData?.totalKeys ?? 0} key{cacheData?.totalKeys === 1 ? "" : "s"} cached
                        </p>
                    </div>
                </div>
            </header>

            <div className="px-6 py-3 border-b border-slate-100">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search cache keys..."
                        className="w-full pl-9 pr-3 h-9 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                    />
                </div>
            </div>

            <div className="px-6 py-4 space-y-3">
                {isLoading && (
                    <div className="flex items-center justify-center py-12 text-sm text-slate-500">
                        Loading cache data...
                    </div>
                )}

                {!isLoading && filteredEntries.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Database size={32} className="text-slate-300 mb-3" />
                        <p className="text-sm font-medium text-slate-600">No cache entries found</p>
                        <p className="text-xs text-slate-400 mt-1">
                            {cacheData ? "Try a different search term." : "Fetch cache to see cached data here."}
                        </p>
                    </div>
                )}

                {!isLoading &&
                    filteredEntries.map((entry) => {
                        const isExpanded = expandedKeys.has(entry.key);
                        const isRaw = rawViewKeys.has(entry.key);
                        const rooms = entry.data?.rooms ?? [];
                        const meta = entry.data?.meta;

                        return (
                            <div key={entry.key} className="border border-slate-200 rounded-xl overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => toggleExpanded(entry.key)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {formatKeyLabel(entry.key)}
                                        </p>
                                        <p className="text-[11px] text-slate-400 font-mono truncate">{entry.key}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {rooms.length > 0 && (
                                            <span className="text-[11px] font-medium bg-white border border-slate-200 rounded-full px-2 py-0.5 text-slate-600">
                                                {rooms.length} room{rooms.length === 1 ? "" : "s"}
                                            </span>
                                        )}
                                        <ChevronDown
                                            size={16}
                                            className={`text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                        />
                                    </div>
                                </button>

                                {isExpanded && (
                                    <div className="px-4 py-4 border-t border-slate-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            {meta && (
                                                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                                                    <span>Page {meta.page}/{meta.pages}</span>
                                                    <span>Limit {meta.limit}</span>
                                                    <span>Total {meta.total}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 ml-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleRawView(entry.key)}
                                                    className="text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100"
                                                >
                                                    {isRaw ? "Show Summary" : "Show Raw JSON"}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopy(entry.key, entry.data)}
                                                    className="flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100"
                                                >
                                                    {copiedKey === entry.key ? (
                                                        <>
                                                            <Check size={12} className="text-green-600" /> Copied
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Copy size={12} /> Copy JSON
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {isRaw ? (
                                            <pre className="bg-slate-900 text-slate-100 text-[11px] leading-relaxed rounded-lg p-4 overflow-x-auto max-h-96">
                                                {JSON.stringify(entry.data, null, 2)}
                                            </pre>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {rooms.map((room) => (
                                                    <CachedRoomCard key={room._id} room={room} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}

function CachedRoomCard({ room }: { room: CachedRoom }) {
    const propertyName =
        typeof room.propertyId === "object" && room.propertyId ? room.propertyId.propertyName : "-";
    const price = room.displayPrice ?? room.pricing?.offerPrice ?? room.pricing?.actualPrice ?? 0;

    return (
        <div className="border border-slate-200 rounded-lg p-3 bg-white">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                        <BedDouble size={14} className="text-emerald-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 truncate">{room.roomName}</p>
                </div>
                {room.isFeatured && <Star size={14} className="text-amber-500 shrink-0" fill="currentColor" />}
            </div>
            <p className="text-[11px] text-slate-400 mb-2 truncate">{propertyName}</p>
            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 capitalize">{room.stayType ?? "daily"}</span>
                <span className="font-bold text-slate-900">₹{Number(price).toLocaleString()}</span>
            </div>
        </div>
    );
}