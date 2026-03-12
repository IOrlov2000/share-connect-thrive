import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

interface ListingCardProps {
  id: string;
  title: string;
  image: string;
  price: string;
  location: string;
  category: string;
  isCharity?: boolean;
}

function OptimizedImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Generate thumbnail URL for Supabase storage images
  const thumbSrc = src.includes("supabase") 
    ? `${src}?width=400&quality=60` 
    : src;

  return (
    <div ref={imgRef} className="absolute inset-0">
      {/* Shimmer placeholder */}
      <div
        className={`absolute inset-0 bg-muted transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="absolute inset-0 shimmer-effect" />
      </div>
      {inView && (
        <img
          src={thumbSrc}
          alt={alt}
          className={`h-full w-full object-cover transition-opacity duration-500 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}

export default function ListingCard({ id, title, image, price, location, category, isCharity }: ListingCardProps) {
  return (
    <Link
      to={`/listing/${id}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-shadow duration-300 hover:shadow-lg active:scale-[0.98] will-change-transform"
    >
      <div className="relative aspect-square overflow-hidden">
        <OptimizedImage src={image} alt={title} />
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1 pointer-events-none">
          {isCharity ? (
            <span className="rounded-full bg-charity px-2 py-0.5 text-[10px] sm:text-xs font-medium text-charity-foreground shrink-0 max-w-[55%] truncate">
              Благотворительность
            </span>
          ) : (
            <span />
          )}
          <span className="rounded-full bg-card/90 px-2 py-0.5 text-[10px] sm:text-xs font-medium backdrop-blur-sm shrink-0 max-w-[45%] truncate">
            {category}
          </span>
        </div>
      </div>
      <div className="p-3 min-w-0">
        <h3 className="font-display text-sm font-semibold truncate">{title}</h3>
        <p className="mt-0.5 text-base sm:text-lg font-bold text-primary truncate">{price}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground min-w-0">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      </div>
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="aspect-square bg-muted">
        <div className="h-full w-full shimmer-effect" />
      </div>
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-muted rounded shimmer-effect" />
        <div className="h-5 w-1/2 bg-muted rounded shimmer-effect" />
        <div className="h-3 w-2/3 bg-muted rounded shimmer-effect" />
      </div>
    </div>
  );
}
