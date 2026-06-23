"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ListDensity, ThemePreference, UiSettings } from "../types";
import {
  applyDensity,
  applyTheme,
  DEFAULT_UI_SETTINGS,
  readUiSettings,
  writeUiSettings,
} from "../utils/uiSettings";

type UiSettingsContextValue = {
  theme: ThemePreference;
  density: ListDensity;
  setTheme: (theme: ThemePreference) => void;
  setDensity: (density: ListDensity) => void;
};

const UiSettingsContext = createContext<UiSettingsContextValue | null>(null);

type UiSettingsProviderProps = {
  children: React.ReactNode;
};

export function UiSettingsProvider({ children }: UiSettingsProviderProps) {
  const [settings, setSettings] = useState<UiSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_UI_SETTINGS;

    const stored = readUiSettings();
    applyTheme(stored.theme);
    applyDensity(stored.density);
    return stored;
  });

  const setTheme = useCallback((theme: ThemePreference) => {
    setSettings((current) => {
      const next = { ...current, theme };
      writeUiSettings(next);
      applyTheme(theme);
      return next;
    });
  }, []);

  const setDensity = useCallback((density: ListDensity) => {
    setSettings((current) => {
      const next = { ...current, density };
      writeUiSettings(next);
      applyDensity(density);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme: settings.theme,
      density: settings.density,
      setTheme,
      setDensity,
    }),
    [settings.theme, settings.density, setTheme, setDensity],
  );

  return (
    <UiSettingsContext.Provider value={value}>
      {children}
    </UiSettingsContext.Provider>
  );
}

export function useUiSettings() {
  const ctx = useContext(UiSettingsContext);
  if (!ctx)
    throw new Error("useUiSettings must be used within UiSettingsProvider");
  return ctx;
}
