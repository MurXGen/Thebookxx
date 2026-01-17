// src/utils/catalogues.js
import {
  BookOpen,
  Sparkles,
  Briefcase,
  User,
  TrendingUp,
  Brain,
  Flame,
  Heart,
  ShieldAlert,
} from "lucide-react";

export const catalogues = [
  {
    key: "trending",
    label: "Trending",
    icon: Flame,
  },
  {
    key: "novel",
    label: "Novels",
    icon: BookOpen,
  },
  {
    key: "self-help",
    label: "Self Help",
    icon: Sparkles,
  },
  {
    key: "finance",
    label: "Finance",
    icon: TrendingUp,
  },
  {
    key: "business",
    label: "Business",
    icon: Briefcase,
  },
  {
    key: "psychology",
    label: "Psychology",
    icon: Brain,
  },
  {
    key: "mental-health",
    label: "Mental Health",
    icon: Heart,
  },
  {
    key: "thriller",
    label: "Thriller",
    icon: ShieldAlert,
  },
  {
    key: "biography",
    label: "Biography",
    icon: User,
  },
];
