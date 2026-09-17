"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet";
import L, { type LatLngBoundsExpression, type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPin = {
  position: LatLngExpression;
  label: string;
  tone: "brand" | "accent";
};

export type MapRing = {
  radiusKm: number;
  label: string;
};

export type LeafletMapProps = {
  pins: MapPin[];
  /** Den rigtige kørselsrute. Er den tom, tegnes en stiplet linje i stedet. */
  route?: [number, number][];
  rings?: MapRing[];
  center: LatLngExpression;
  zoom?: number;
};

const TONES = {
  brand: "#0369a1",
  accent: "#16a34a",
} as const;

/** Farvet dråbeformet nål med hvidt hul i midten. */
function pinIcon(tone: MapPin["tone"]) {
  const color = TONES[tone];
  return L.divIcon({
    className: "",
    iconSize: [32, 44],
    iconAnchor: [16, 44],
    tooltipAnchor: [0, -38],
    html: `<svg width="32" height="44" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 43C16 43 30 26.5 30 16A14 14 0 1 0 2 16c0 10.5 14 27 14 27z"
        fill="${color}" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="16" cy="16" r="5" fill="#ffffff" />
    </svg>`,
  });
}

/** Holder kortet indstillet på det, der er i det, også når adressen skifter. */
function FitToContent({
  bounds,
  center,
  zoom,
}: {
  bounds: LatLngBoundsExpression | null;
  center: LatLngExpression;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
    } else {
      map.setView(center, zoom);
    }
  }, [map, bounds, center, zoom]);

  return null;
}

export default function LeafletMap({
  pins,
  route = [],
  rings = [],
  center,
  zoom = 12,
}: LeafletMapProps) {
  const points: LatLngExpression[] = route.length > 0 ? route : pins.map((p) => p.position);
  const bounds = pins.length > 1 || route.length > 0 ? L.latLngBounds(points) : null;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='Kort: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      {rings.map((ring) => (
        <Circle
          key={ring.radiusKm}
          center={center}
          radius={ring.radiusKm * 1000}
          pathOptions={{
            color: TONES.brand,
            weight: 2,
            opacity: 0.6,
            fillColor: TONES.brand,
            fillOpacity: 0.05,
          }}
        >
          <Tooltip direction="top" permanent={false}>
            {ring.label}
          </Tooltip>
        </Circle>
      ))}

      {route.length > 1 && (
        <Polyline
          positions={route}
          pathOptions={{ color: TONES.brand, weight: 6, opacity: 0.9 }}
        />
      )}

      {route.length === 0 && pins.length > 1 && (
        <Polyline
          positions={pins.map((p) => p.position)}
          pathOptions={{ color: TONES.brand, weight: 4, opacity: 0.6, dashArray: "8 10" }}
        />
      )}

      {pins.map((pin) => (
        <Marker key={pin.label} position={pin.position} icon={pinIcon(pin.tone)}>
          <Tooltip direction="top" permanent>
            {pin.label}
          </Tooltip>
        </Marker>
      ))}

      <FitToContent bounds={bounds} center={center} zoom={zoom} />
    </MapContainer>
  );
}
