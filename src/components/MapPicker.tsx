"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState, useRef, useEffect } from "react";

interface Position {
    lat: number;
    lng: number;
}

interface MapPickerProps {
    onSelect: (mapLink: string) => void;
    initialPosition?: Position | null;
    isInput?: boolean;
}

const containerStyle = {
    width: "100%",
    height: "400px",
};

const defaultCenter: Position = {
    lat: 20,
    lng: 78,
};

export default function MapPicker({
    onSelect,
    initialPosition = null,
    isInput = true,
}: MapPickerProps) {
    const [position, setPosition] = useState<Position>(
        initialPosition || defaultCenter
    );

    const [query, setQuery] = useState<string>("");

    const mapRef = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);

            if (mapRef.current) {
                mapRef.current.panTo(initialPosition);
                mapRef.current.setZoom(13);
            }
        }
    }, [initialPosition]);

    const handleMapClick = (
        e: google.maps.MapMouseEvent
    ) => {
        if (!e.latLng) return;

        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        const newPos: Position = { lat, lng };

        setPosition(newPos);

        if (mapRef.current) {
            mapRef.current.panTo(newPos);
            mapRef.current.setZoom(15);
        }

        onSelect(`https://maps.google.com/?q=${lat},${lng}`);
    };

    const handleSearch = (
        e: React.FormEvent | React.KeyboardEvent
    ) => {
        e.preventDefault();

        if (!query.trim()) return;

        const geocoder = new window.google.maps.Geocoder();

        geocoder.geocode(
            { address: query },
            (results, status) => {
                if (
                    status === "OK" &&
                    results &&
                    results.length > 0
                ) {
                    const location =
                        results[0].geometry.location;

                    const lat = location.lat();
                    const lng = location.lng();

                    const newPos: Position = {
                        lat,
                        lng,
                    };

                    setPosition(newPos);

                    if (mapRef.current) {
                        mapRef.current.panTo(newPos);
                        mapRef.current.setZoom(13);
                    }

                    onSelect(
                        `https://maps.google.com/?q=${lat},${lng}`
                    );
                } else {
                    alert("Location not found");
                }
            }
        );
    };

    return (
        <div>
            {isInput && (
                <div className="flex gap-2 mb-2">
                    <input
                        value={query}
                        onChange={(e) =>
                            setQuery(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSearch(e);
                            }
                        }}
                        placeholder="Search location (eg: Chennai, Tamil Nadu)"
                        className="border p-2 w-full rounded focus:outline-none border-gray-300"
                    />

                    <button
                        type="button"
                        onClick={handleSearch}
                        className="px-4 bg-black text-white rounded"
                    >
                        Search
                    </button>
                </div>
            )}

            <LoadScript
                googleMapsApiKey={
                    import.meta.env.VITE_PUBLIC_GOOGLE_MAP_KEY
                }
            >
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={position}
                    zoom={initialPosition ? 13 : 5}
                    onLoad={(map) => {
                        mapRef.current = map;
                    }}
                    onClick={handleMapClick}
                >
                    <Marker position={position} />
                </GoogleMap>
            </LoadScript>
        </div>
    );
}