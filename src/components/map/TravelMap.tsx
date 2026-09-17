"use client";

import dynamic from "next/dynamic";
import type { LeafletMapProps, MapRing } from "./LeafletMap";

/** Leaflet skal først indlæses i browseren — det kan ikke tegnes på serveren. */
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-muted text-ink-soft">
      Henter kort …
    </div>
  ),
});

export type MapHome = { lat: number; lon: number; city: string; postalCode: string };

type RouteMapProps = {
  home: MapHome;
  destination: { lat: number; lon: number };
  addressText: string;
  distanceKm: number;
  drivingMinutes: number;
  route?: [number, number][];
  /** Vises, hvis afstanden kun er et estimat. */
  isEstimate?: boolean;
};

/** Kort med min adresse, kundens adresse og vejen imellem. */
export function RouteMap({
  home,
  destination,
  addressText,
  distanceKm,
  drivingMinutes,
  route = [],
  isEstimate = false,
}: RouteMapProps) {
  const origin: [number, number] = [home.lat, home.lon];

  return (
    <figure className="m-0 scroll-mb-40">
      <div className="h-80 overflow-hidden rounded-card border border-line">
        <LeafletMap
          center={origin}
          pins={[
            { position: origin, label: `Mig – ${home.city}`, tone: "brand" },
            { position: [destination.lat, destination.lon], label: "Dig", tone: "accent" },
          ]}
          route={route}
        />
      </div>

      <figcaption className="mt-3 text-ink-soft">
        Fra {home.postalCode} {home.city} til {addressText}:{" "}
        <strong className="text-ink tabular-nums">{distanceKm} km</strong>, ca.{" "}
        <strong className="text-ink tabular-nums">{drivingMinutes} min.</strong> i bil.
        {isEstimate && " Afstanden er et skøn."}
      </figcaption>
    </figure>
  );
}

/** Kort over hele mit område med zonerne tegnet op. */
export function ServiceAreaMap({ home, rings }: { home: MapHome; rings: MapRing[] }) {
  const origin: [number, number] = [home.lat, home.lon];
  const props: LeafletMapProps = {
    center: origin,
    zoom: 10,
    pins: [{ position: origin, label: `Mig – ${home.city}`, tone: "brand" }],
    rings,
  };

  return (
    <div className="h-96 overflow-hidden rounded-card border border-line">
      <LeafletMap {...props} />
    </div>
  );
}
