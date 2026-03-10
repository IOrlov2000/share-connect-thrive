import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  name: string;
  icon: LucideIcon;
  count: number;
  color: string;
}

export default function CategoryCard({ name, icon: Icon, count, color }: CategoryCardProps) {
  return (
    <div className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:shadow-md hover:-translate-y-0.5 ${color}`}>
      <Icon className="h-7 w-7" />
      <span className="text-sm font-semibold font-display">{name}</span>
      <span className="text-xs text-muted-foreground">{count} items</span>
    </div>
  );
}
