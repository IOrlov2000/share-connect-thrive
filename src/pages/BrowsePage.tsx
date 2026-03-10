import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ListingCard from "@/components/ListingCard";

const allListings = [
  { id: "1", title: "MacBook Pro 2023 - Like New", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", price: "$899", location: "Brooklyn, NY", category: "Electronics" },
  { id: "2", title: "Vintage Leather Jacket", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", price: "$120", location: "Manhattan, NY", category: "Clothing" },
  { id: "3", title: "Mid-Century Modern Chair", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop", price: "$250", location: "Queens, NY", category: "Furniture" },
  { id: "4", title: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop", price: "$450", location: "Bronx, NY", category: "Sports" },
  { id: "5", title: "Nintendo Switch Bundle", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop", price: "$200", location: "Jersey City, NJ", category: "Gaming" },
  { id: "6", title: "Antique Desk Lamp", image: "https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=400&h=400&fit=crop", price: "$45", location: "Staten Island, NY", category: "Furniture" },
  { id: "7", title: "Running Shoes Nike Air", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", price: "$65", location: "Brooklyn, NY", category: "Clothing" },
  { id: "8", title: "Canon EOS R6 Camera", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=400&fit=crop", price: "$1,200", location: "Manhattan, NY", category: "Electronics" },
];

const categories = ["All", "Electronics", "Clothing", "Furniture", "Sports", "Gaming", "Books", "Kids", "Tools"];

export default function BrowsePage() {
  return (
    <div className="container py-6 space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Browse Listings</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search items..." className="pl-10 h-12 rounded-full" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={cat === "All" ? "default" : "outline"}
            className="cursor-pointer whitespace-nowrap px-4 py-1.5 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {cat}
          </Badge>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {allListings.map((listing) => (
          <ListingCard key={listing.id} {...listing} />
        ))}
      </div>
    </div>
  );
}
