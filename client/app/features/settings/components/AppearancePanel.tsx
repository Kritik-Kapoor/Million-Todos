"use client";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/tailwindMerge";
import type { ListDensity, ThemePreference } from "../types";
import PanelHeader from "./PanelHeader";
import { useUiSettings } from "../context/UiSettingsContext";

const THEME_OPTIONS: ThemePreference[] = ["light", "dark", "system"];
const DENSITY_OPTIONS: ListDensity[] = ["comfortable", "compact"];

const AppearancePanel = () => {
  const { theme, density, setTheme, setDensity } = useUiSettings();

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Appearance"
        description="Customize how the app looks on your device."
      />
      <div className="space-y-3">
        <Label>Theme</Label>
        <div className="grid max-w-md grid-cols-3 gap-2">
          {THEME_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={cn(
                "rounded-lg border p-3 text-sm capitalize transition-colors",
                theme === option
                  ? "border-foreground bg-accent"
                  : "hover:bg-accent/50",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Label>List density</Label>
        <div className="grid max-w-md grid-cols-2 gap-2">
          {DENSITY_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setDensity(option)}
              className={cn(
                "rounded-lg border p-3 text-sm capitalize transition-colors",
                density === option
                  ? "border-foreground bg-accent"
                  : "hover:bg-accent/50",
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppearancePanel;
