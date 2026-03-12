import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapListing {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number | null;
  is_charity?: boolean;
  image?: string;
}

interface ListingsMapProps {
  listings: MapListing[];
  className?: string;
}

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function ListingsMap({ listings, className = "" }: ListingsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([55.7558, 37.6173], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) map.removeLayer(layer);
    });

    const bounds: L.LatLngExpression[] = [];

    listings.forEach((listing) => {
      if (listing.latitude && listing.longitude) {
        const marker = L.marker([listing.latitude, listing.longitude]).addTo(map);
        const imgSrc = listing.image || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=120&h=120&fit=crop";
        const priceText = listing.is_charity ? "Бесплатно" : listing.price ? listing.price.toLocaleString() + " ₽" : "Договорная";
        marker.bindPopup(
          `<div style="display:flex;gap:8px;min-width:200px">
            <img src="${imgSrc}" alt="" style="width:70px;height:70px;object-fit:cover;border-radius:8px;flex-shrink:0"/>
            <div style="display:flex;flex-direction:column;justify-content:center;gap:3px">
              <strong style="font-size:13px">${listing.title}</strong>
              <span style="color:#f97316;font-weight:600;font-size:13px">${priceText}</span>
              <a href="/listing/${listing.id}" class="leaflet-listing-link" style="color:#f97316;text-decoration:underline;font-size:12px">Открыть →</a>
            </div>
          </div>`,
          { minWidth: 220 }
        );
        marker.on("popupopen", () => {
          setTimeout(() => {
            document.querySelectorAll(".leaflet-listing-link").forEach((el) => {
              el.addEventListener("click", (e) => {
                e.preventDefault();
                const href = (e.currentTarget as HTMLAnchorElement).getAttribute("href");
                if (href) navigateRef.current(href);
              });
            });
          }, 50);
        });
        bounds.push([listing.latitude, listing.longitude]);
      }
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, { padding: [30, 30], maxZoom: 12 });
    }
  }, [listings]);

  return <div ref={mapRef} className={`w-full rounded-xl border ${className}`} style={{ height: "300px" }} />;
}
