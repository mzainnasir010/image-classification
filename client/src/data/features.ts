import {
  Gauge,
  HelpCircle,
  ListOrdered,
  Zap,
  ExternalLink,
  Sun,
  type LucideIcon,
} from "lucide-react";

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const features: Feature[] = [
  {
    id: "calibrated",
    title: "Calibrated confidence",
    description:
      "Temperature scaling aligns probability scores with real accuracy. A 90% confidence means the model is right roughly 90% of the time.",
    icon: Gauge,
  },
  {
    id: "uncertain",
    title: "Honest uncertainty",
    description:
      "When confidence is below the 70% threshold the result is flagged as uncertain rather than silently returning a wrong answer.",
    icon: HelpCircle,
  },
  {
    id: "top3",
    title: "Top-3 predictions",
    description:
      "Every response includes the three most likely classes with their probabilities so you can see the full picture.",
    icon: ListOrdered,
  },
  {
    id: "fast",
    title: "Fast single-image inference",
    description:
      "One POST request is all it takes. The ResNet50 backbone classifies in milliseconds on the server.",
    icon: Zap,
  },
  {
    id: "opensource",
    title: "Open source",
    description:
      "The full training notebook, model weights, and server code are available on GitHub. Inspect, fork, or extend at will.",
    icon: ExternalLink,
  },
  {
    id: "themes",
    title: "Light and dark themes",
    description:
      "Follows your system preference automatically, with a manual override. The experience is clean in both.",
    icon: Sun,
  },
];
