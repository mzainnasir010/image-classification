import { Building2, Trees, Mountain, Waves, Milestone, type LucideIcon } from "lucide-react";

export interface SceneClassInfo {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const sceneClasses: SceneClassInfo[] = [
  {
    id: "buildings",
    label: "Buildings",
    description: "Urban structures: apartments, offices, towers, and cityscape skylines.",
    icon: Building2,
  },
  {
    id: "forest",
    label: "Forest",
    description: "Dense woodland, jungle, or tree canopy scenes with abundant vegetation.",
    icon: Trees,
  },
  {
    id: "glacier",
    label: "Glacier",
    description: "Ice fields, frozen lakes, and glacial landscapes in arctic regions.",
    icon: Mountain,
  },
  {
    id: "mountain",
    label: "Mountain",
    description: "Rocky peaks, hillsides, and elevated terrain without heavy ice cover.",
    icon: Mountain,
  },
  {
    id: "sea",
    label: "Sea",
    description: "Ocean, beach, coastline, and open-water scenes.",
    icon: Waves,
  },
  {
    id: "street",
    label: "Street",
    description: "Roads, pavements, urban ground-level views with vehicles and signage.",
    icon: Milestone,
  },
];
