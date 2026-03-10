import { useState } from "react";
import { Camera, MapPin, Tag, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const categories = ["Electronics", "Clothing", "Furniture", "Sports", "Books", "Gaming", "Kids", "Tools", "Other"];

export default function CreateListingPage() {
  const [images, setImages] = useState<string[]>([]);
  const [isCharity, setIsCharity] = useState(false);

  return (
    <div className="container max-w-lg py-6 space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold">Create Listing</h1>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Photos</Label>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <label
              key={i}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-primary hover:bg-accent"
            >
              <Camera className="h-6 w-6 text-muted-foreground" />
              <span className="mt-1 text-xs text-muted-foreground">Add photo</span>
              <input type="file" accept="image/*" className="hidden" />
            </label>
          ))}
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label>Title</Label>
        <Input placeholder="What are you selling?" className="h-12" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea placeholder="Describe your item, condition, and details..." rows={4} />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label>Price</Label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="number" placeholder="0.00" className="pl-10 h-12" disabled={isCharity} />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label>Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Enter your location" className="pl-10 h-12" />
        </div>
      </div>

      {/* Charity Toggle */}
      <div className="flex items-center justify-between rounded-xl border bg-charity/5 p-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-semibold">Donate to charity</Label>
          <p className="text-xs text-muted-foreground">This item will be listed as free for foundations</p>
        </div>
        <Switch checked={isCharity} onCheckedChange={setIsCharity} />
      </div>

      <Button className="w-full h-12 text-base">Publish Listing</Button>
    </div>
  );
}
