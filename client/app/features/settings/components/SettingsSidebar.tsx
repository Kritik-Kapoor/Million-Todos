"use client";

import { cn } from "@/lib/utils/tailwindMerge";

import { SETTINGS_TABS } from "../constants";
import type { SettingsTabKey } from "../types";

type SettingsSidebarProps = {
  activeTab: SettingsTabKey;
  onTabChange: (tab: SettingsTabKey) => void;
};

const SettingsSidebar = ({ activeTab, onTabChange }: SettingsSidebarProps) => {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/50 p-3">
      <div className="px-2 pt-1 pb-3">
        <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Settings
        </p>
      </div>
      <nav className="flex flex-col gap-1">
        {SETTINGS_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onTabChange(key)}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
              activeTab === key
                ? "bg-background text-foreground shadow-sm font-semibold"
                : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
