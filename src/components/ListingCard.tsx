import { useState } from "react";
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

export default function ListingCard({ id, title, image, price, location, category, isCharity }: ListingCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link to={`/listing/${id}`} className="group animate-fade-in cursor-pointer overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg hover:-translate-y-1 block">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {!imgLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={image}
          alt={title}
          className={`h-full w-full object-cover transition-all duration-300 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
        />
        {isCharity && (
          <span className="absolute top-2 left-2 rounded-full bg-charity px-2.5 py-0.5 text-xs font-medium text-charity-foreground">
            Благотворительность
          </span>
        )}
        <span className="absolute top-2 right-2 rounded-full bg-card/90 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm">
          {category}
        </span>
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
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
        <div className="h-5 w-1/2 bg-muted animate-pulse rounded" />
        <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
}
