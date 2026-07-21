import {
  Bell,
  Database,
  Palette,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react";

import type { SettingsTabKey } from "./types";

export const DEFAULT_LABEL_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
] as const;

export const SETTINGS_TABS: {
  key: SettingsTabKey;
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "account", label: "Account", icon: User },
  { key: "labels", label: "Labels", icon: Tag },
  { key: "appearance", label: "Appearance", icon: Palette },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "data", label: "Data", icon: Database },
];

export const labelQueryKeys = {
  all: ["labels"] as const,
};

export const userQueryKeys = {
  current: ["currentUser"] as const,
};
