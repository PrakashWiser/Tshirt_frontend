"use client";

import { useEffect, useState } from "react";
import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Position {
    lat: number;
    lng: number;
}

interface MapPickerProps {
    onSelect: (data: {
        mapLink: string;
        latitude: number;
        longitude: number;
    }) => void;
    initialPosition?: Position | null;
    isInput?: boolean;
    height?: string | number;
}

const defaultCenter: Position = {
    lat: 20,
    lng: 78,
};

const markerIcon = L.icon({
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface MapControllerProps {
    position: Position;
}

function MapController({ position }: MapControllerProps) {
    const map = useMap();

    useEffect(() => {
        map.panTo([position.lat, position.lng]);
        map.setZoom(15);
    }, [position, map]);

    return null;
}

interface MapClickHandlerProps {
    onSelectPosition: (position: Position) => void;
}

function MapClickHandler({
    onSelectPosition,
}: MapClickHandlerProps) {
    useMapEvents({
        click(event) {
            onSelectPosition({
                lat: event.latlng.lat,
                lng: event.latlng.lng,
            });
        },
    });

    return null;
}

export default function MapPicker({
    onSelect,
    initialPosition = null,
    isInput = true,
    height = "400px",
}: MapPickerProps) {
    const [position, setPosition] = useState<Position>(
        initialPosition ?? defaultCenter
    );

    const [query, setQuery] = useState("");

    useEffect(() => {
        if (initialPosition) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    const handlePositionSelect = (newPosition: Position) => {
        setPosition(newPosition);

        onSelect({
            mapLink: `https://maps.google.com/?q=${newPosition.lat},${newPosition.lng}`,
            latitude: newPosition.lat,
            longitude: newPosition.lng,
        });
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    query
                )}&limit=1`
            );

            if (!response.ok) {
                throw new Error("Location search failed");
            }

            const results = await response.json();

            if (!results || results.length === 0) {
                alert("Location not found");
                return;
            }

            const lat = Number(results[0].lat);
            const lng = Number(results[0].lon);

            if (Number.isNaN(lat) || Number.isNaN(lng)) {
                alert("Invalid location coordinates");
                return;
            }

            const newPosition: Position = {
                lat,
                lng,
            };

            setPosition(newPosition);

            onSelect({
                mapLink: `https://maps.google.com/?q=${lat},${lng}`,
                latitude: lat,
                longitude: lng,
            });
        } catch (error) {
            console.error("Location search failed:", error);
            alert("Unable to search location");
        }
    };

    return (
        <div className="w-full">
            {isInput && (
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                event.stopPropagation();
                                handleSearch();
                            }
                        }}
                        placeholder="Search location (eg: Chennai, Tamil Nadu)"
                        className="border border-gray-300 p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <button
                        type="button"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            handleSearch();
                        }}
                        className="px-5 bg-[#3A29AA] text-white rounded hover:bg-gray-800 transition"
                    >
                        Search
                    </button>
                </div>
            )}

            <MapContainer
                center={[position.lat, position.lng]}
                zoom={initialPosition ? 13 : 5}
                scrollWheelZoom
                style={{
                    width: "100%",
                    height,
                    borderRadius: "12px",
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapController position={position} />

                <MapClickHandler
                    onSelectPosition={handlePositionSelect}
                />

                <Marker
                    position={[position.lat, position.lng]}
                    icon={markerIcon}
                />
            </MapContainer>
        </div>
    );
}