import { Settings, MapPin, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingCard from "@/components/ListingCard";

const myListings = [
  { id: "1", title: "MacBook Pro 2023", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop", price: "$899", location: "Brooklyn, NY", category: "Electronics" },
  { id: "2", title: "Vintage Leather Jacket", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", price: "$120", location: "Brooklyn, NY", category: "Clothing" },
];

export default function ProfilePage() {
  return (
    <div className="container max-w-2xl py-6 space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display font-bold">JS</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">John Smith</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Brooklyn, NY
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-secondary text-secondary" /> 4.8</span>
            <span className="text-sm text-muted-foreground">• 23 trades</span>
          </div>
        </div>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Listings", value: "12" },
          { label: "Sold", value: "8" },
          { label: "Donated", value: "3" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4 text-center">
            <p className="text-2xl font-bold font-display">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="listings">
        <TabsList className="w-full">
          <TabsTrigger value="listings" className="flex-1">My Listings</TabsTrigger>
          <TabsTrigger value="favorites" className="flex-1">Favorites</TabsTrigger>
          <TabsTrigger value="history" className="flex-1">History</TabsTrigger>
        </TabsList>
        <TabsContent value="listings" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {myListings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="favorites" className="mt-4">
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-10 w-10 mb-2" />
            <p>No favorites yet</p>
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="h-10 w-10 mb-2" />
            <p>No trade history yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
