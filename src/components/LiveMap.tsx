import { useEffect, useRef } from "react";
import type * as LeafletNS from "leaflet";

type Point = { lat: number; lng: number };

export function LiveMap({
  rider,
  destination,
  className = "h-72 w-full rounded-lg border border-border",
}: {
  rider?: Point | null;
  destination?: Point | null;
  className?: string;
}) {
  const holder = useRef<HTMLDivElement | null>(null);
  const map = useRef<LeafletNS.Map | null>(null);
  const riderMarker = useRef<LeafletNS.CircleMarker | null>(null);
  const destMarker = useRef<LeafletNS.CircleMarker | null>(null);
  const line = useRef<LeafletNS.Polyline | null>(null);
  const leaflet = useRef<typeof LeafletNS | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await import("leaflet/dist/leaflet.css");
      const L = await import("leaflet");
      if (cancelled || !holder.current || map.current) return;
      leaflet.current = L;
      const start = rider ?? destination ?? { lat: 12.9716, lng: 77.5946 };
      const m = L.map(holder.current, { zoomControl: true, attributionControl: true }).setView(
        [start.lat, start.lng],
        14,
      );
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(m);
      map.current = m;
      setTimeout(() => m.invalidateSize(), 200);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      riderMarker.current = null;
      destMarker.current = null;
      line.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = leaflet.current;
    const m = map.current;
    if (!L || !m) return;

    if (destination) {
      if (!destMarker.current) {
        destMarker.current = L.circleMarker([destination.lat, destination.lng], {
          radius: 9,
          color: "#8a5a2b",
          fillColor: "#e2b04a",
          fillOpacity: 1,
          weight: 3,
        })
          .addTo(m)
          .bindTooltip("Delivery address");
      } else {
        destMarker.current.setLatLng([destination.lat, destination.lng]);
      }
    }

    if (rider) {
      if (!riderMarker.current) {
        riderMarker.current = L.circleMarker([rider.lat, rider.lng], {
          radius: 10,
          color: "#ffffff",
          fillColor: "#c0562b",
          fillOpacity: 1,
          weight: 3,
        })
          .addTo(m)
          .bindTooltip("Your delivery rider");
      } else {
        riderMarker.current.setLatLng([rider.lat, rider.lng]);
      }
      m.panTo([rider.lat, rider.lng], { animate: true });
    }

    if (rider && destination) {
      const pts: [number, number][] = [
        [rider.lat, rider.lng],
        [destination.lat, destination.lng],
      ];
      if (!line.current) {
        line.current = L.polyline(pts, { color: "#c0562b", dashArray: "6 8", weight: 2 }).addTo(m);
      } else {
        line.current.setLatLngs(pts);
      }
      m.fitBounds(L.latLngBounds(pts).pad(0.4));
    }
  }, [rider?.lat, rider?.lng, destination?.lat, destination?.lng, rider, destination]);

  return <div ref={holder} className={className} />;
}

export default LiveMap;
