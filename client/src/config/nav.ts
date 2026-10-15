import {
  LayoutGrid,
  Clock,
  BarChart2,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const dashboardNav: NavItem[] = [
  { label: "Classify", path: "/app", icon: LayoutGrid },
  { label: "History", path: "/app/history", icon: Clock },
  { label: "Model", path: "/app/model", icon: BarChart2 },
  { label: "API", path: "/app/api", icon: BookOpen },
];
