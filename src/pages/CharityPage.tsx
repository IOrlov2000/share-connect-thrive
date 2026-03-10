import { Heart, Building2 } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";

const charityListings = [
  { id: "c1", title: "Children's Books Collection", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=400&fit=crop", price: "Free", location: "Hoboken, NJ", category: "Books", isCharity: true },
  { id: "c2", title: "Baby Clothes Bundle (0-12m)", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop", price: "Free", location: "Brooklyn, NY", category: "Kids", isCharity: true },
  { id: "c3", title: "Winter Coats (Various Sizes)", image: "https://images.unsplash.com/photo-1544923246-77307dd270cb?w=400&h=400&fit=crop", price: "Free", location: "Manhattan, NY", category: "Clothing", isCharity: true },
  { id: "c4", title: "Office Desk & Chair Set", image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop", price: "Free", location: "Queens, NY", category: "Furniture", isCharity: true },
];

const foundations = [
  { name: "Helping Hands Foundation", items: 156, icon: "🤝" },
  { name: "Kids First Charity", items: 89, icon: "👶" },
  { name: "Community Care Center", items: 234, icon: "🏘️" },
];

export default function CharityPage() {
  return (
    <div className="container py-6 space-y-8 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-charity/10 to-primary/10 p-8 text-center">
        <Heart className="mx-auto h-12 w-12 text-charity mb-4" />
        <h1 className="font-display text-3xl font-bold">Give Back to Your Community</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Donate items to local foundations and help those in need. Every item makes a difference.
        </p>
        <Button className="mt-4 bg-charity hover:bg-charity/90 text-charity-foreground">
          Donate an Item
        </Button>
      </section>

      {/* Partner Foundations */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Partner Foundations
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {foundations.map((f) => (
            <div key={f.name} className="flex items-center gap-3 rounded-xl border bg-card p-4 cursor-pointer hover:shadow-md transition-all">
              <span className="text-3xl">{f.icon}</span>
              <div>
                <p className="font-semibold text-sm">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.items} items received</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Charity Listings */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Available Donations</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {charityListings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </div>
      </section>
    </div>
  );
}
