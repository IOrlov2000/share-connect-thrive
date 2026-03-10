import { Search, Laptop, Shirt, Sofa, Bike, BookOpen, Gamepad2, Baby, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import ListingCard from "@/components/ListingCard";
import CategoryCard from "@/components/CategoryCard";

const categories = [
  { name: "Electronics", icon: Laptop, count: 234, color: "bg-blue-50 text-blue-600" },
  { name: "Clothing", icon: Shirt, count: 189, color: "bg-pink-50 text-pink-600" },
  { name: "Furniture", icon: Sofa, count: 97, color: "bg-amber-50 text-amber-600" },
  { name: "Sports", icon: Bike, count: 156, color: "bg-green-50 text-green-600" },
  { name: "Books", icon: BookOpen, count: 312, color: "bg-purple-50 text-purple-600" },
  { name: "Gaming", icon: Gamepad2, count: 78, color: "bg-red-50 text-red-600" },
  { name: "Kids", icon: Baby, count: 145, color: "bg-teal-50 text-teal-600" },
  { name: "Tools", icon: Wrench, count: 63, color: "bg-orange-50 text-orange-600" },
];

const featuredListings = [
  { id: "1", title: "MacBook Pro 2023 - Like New", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", price: "$899", location: "Brooklyn, NY", category: "Electronics" },
  { id: "2", title: "Vintage Leather Jacket", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", price: "$120", location: "Manhattan, NY", category: "Clothing" },
  { id: "3", title: "Mid-Century Modern Chair", image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop", price: "$250", location: "Queens, NY", category: "Furniture" },
  { id: "4", title: "Mountain Bike - Trek", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=400&h=400&fit=crop", price: "$450", location: "Bronx, NY", category: "Sports" },
  { id: "5", title: "Nintendo Switch Bundle", image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=400&h=400&fit=crop", price: "$200", location: "Jersey City, NJ", category: "Gaming" },
  { id: "6", title: "Children's Books Collection", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop", price: "Free", location: "Hoboken, NJ", category: "Books", isCharity: true },
];

export default function HomePage() {
  return (
    <div className="container py-6 space-y-8">
      {/* Hero */}
      <section className="text-center space-y-4 py-8 animate-fade-in">
        <h1 className="font-display text-4xl font-bold md:text-5xl">
          Find & Trade on <span className="text-gradient">SwapSpot</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Exchange items locally, discover deals, or donate to those in need.
        </p>
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search items near you..." className="pl-10 h-12 rounded-full" />
        </div>
      </section>

      {/* Categories */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Categories</h2>
        <div className="grid grid-cols-4 gap-3 md:grid-cols-8">
          {categories.map((cat) => (
            <CategoryCard key={cat.name} {...cat} />
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Featured Listings</h2>
          <a href="/browse" className="text-sm text-primary font-medium hover:underline">View all →</a>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
