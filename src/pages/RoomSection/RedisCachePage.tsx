import { useEffect } from "react";
import Button from "../../components/Button";
import RedisCacheView from "./RedisCacheView";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import {
    getRoomRedisCache,
    clearRoomRedisCache,
    getAllRooms,
    clearRoomError,
} from "../../store/slice/roomSlice";
import { addToast } from "../../store/slice/uiSlice";

export default function RedisCachePage() {
    const dispatch = useAppDispatch();
    const { isLoading, error, message, redisCache } = useAppSelector((state) => state.rooms);

    useEffect(() => {
        dispatch(getRoomRedisCache());
    }, [dispatch]);

    const handleRefresh = () => {
        dispatch(getRoomRedisCache());
    };

    const handleClear = () => {
        dispatch(clearRoomRedisCache());
    };

    useEffect(() => {
        if (message) {
            dispatch(addToast({ type: "success", text: message }));
            dispatch(getAllRooms());
            dispatch(getRoomRedisCache());
            dispatch(clearRoomError());
        }
        if (error) {
            dispatch(addToast({ type: "error", text: error }));
            dispatch(clearRoomError());
        }
    }, [message, error, dispatch]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Redis Cache</h1>
                <div className="flex gap-3">
                    <Button
                        className="flex items-center gap-2 px-4 h-9 rounded-lg border border-slate-200 bg-black text-sm font-medium"
                        onClick={handleRefresh}
                    >
                        Refresh
                    </Button>
                    <Button
                        className="flex items-center gap-2 px-4 h-9 rounded-lg border border-slate-200 bg-black text-sm font-medium"
                        variant="outline"
                        onClick={handleClear}
                    >
                        Clear Cache
                    </Button>
                </div>
            </div>
            <RedisCacheView cacheData={redisCache} isLoading={isLoading} />
        </div>
    );
}