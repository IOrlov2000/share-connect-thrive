import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

interface MapListing {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  price: number | null;
  is_charity?: boolean;
  image?: string;
}

interface YandexMapProps {
  listings: MapListing[];
  className?: string;
}

declare global {
  interface Window {
    ymaps: any;
  }
}

export default function YandexMap({ listings, className = "" }: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const navigateRef = useRef<((path: string) => void) | null>(null);
  const navigate = useNavigate();
  navigateRef.current = navigate;

  useEffect(() => {
    const loadScript = () => {
      return new Promise<void>((resolve) => {
        if (window.ymaps) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = "https://api-maps.yandex.ru/2.1/?apikey=none&lang=ru_RU";
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    let destroyed = false;

    loadScript().then(() => {
      if (destroyed || !mapRef.current) return;
      window.ymaps.ready(() => {
        if (destroyed || !mapRef.current || mapInstanceRef.current) return;

        const map = new window.ymaps.Map(mapRef.current, {
          center: [55.75, 37.62],
          zoom: 4,
          controls: ["zoomControl", "geolocationControl"],
          restrictMapArea: [[41.0, 19.0], [82.0, 180.0]],
        });

        mapInstanceRef.current = map;

        const clusterer = new window.ymaps.Clusterer({
          preset: "islands#invertedOrangeClusterIcons",
          groupByCoordinates: false,
          clusterDisableClickZoom: false,
        });

        const placemarks = listings
          .filter((l) => l.latitude && l.longitude)
          .map((l) => {
            const priceText = l.is_charity ? "Бесплатно" : l.price ? `${l.price.toLocaleString()} ₽` : "Договорная";
            const imgSrc = l.image || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=120&h=120&fit=crop";
            const pm = new window.ymaps.Placemark(
              [l.latitude, l.longitude],
              {
                balloonContentHeader: `<a href="/listing/${l.id}" class="ym-listing-link" style="color:#f97316;font-weight:600;text-decoration:none;font-size:14px;cursor:pointer">${l.title}</a>`,
                balloonContentBody: `
                  <div style="display:flex;gap:10px;padding:6px 0;min-width:220px">
                    <img src="${imgSrc}" alt="" style="width:80px;height:80px;object-fit:cover;border-radius:8px;flex-shrink:0" />
                    <div style="display:flex;flex-direction:column;justify-content:center;gap:4px">
                      <div style="font-size:15px;font-weight:600;color:#f97316">${priceText}</div>
                      <a href="/listing/${l.id}" class="ym-listing-link" style="color:#f97316;font-size:13px;text-decoration:underline;cursor:pointer">Открыть →</a>
                    </div>
                  </div>`,
                hintContent: l.title,
              },
              {
                preset: "islands#orangeDotIcon",
              }
            );
            pm.events.add('balloonopen', () => {
              setTimeout(() => {
                document.querySelectorAll('.ym-listing-link').forEach((el) => {
                  el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const href = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
                    if (href && navigateRef.current) navigateRef.current(href);
                  });
                });
              }, 100);
            });
            return pm;
          });

        clusterer.add(placemarks);
        map.geoObjects.add(clusterer);

        if (placemarks.length > 0) {
          map.setBounds(clusterer.getBounds(), { checkZoomRange: true, zoomMargin: 40 });
        }
      });
    });

    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [listings]);

  return (
    <div
      ref={mapRef}
      className={`w-full rounded-xl border overflow-hidden ${className}`}
      style={{ height: "360px" }}
    />
  );
}
