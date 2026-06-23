import type { ListDensity, ThemePreference, UiSettings } from "../types";

export const UI_SETTINGS_STORAGE_KEY = "million-todo-ui-settings";

export const DEFAULT_UI_SETTINGS: UiSettings = {
  theme: "system",
  density: "comfortable",
};

export function readUiSettings(): UiSettings {
  try {
    const raw = localStorage.getItem(UI_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_UI_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<UiSettings>;

    const settings: UiSettings = {
      theme: isTheme(parsed.theme) ? parsed.theme : DEFAULT_UI_SETTINGS.theme,
      density: isDensity(parsed.density)
        ? parsed.density
        : DEFAULT_UI_SETTINGS.density,
    };

    if (!isTheme(parsed.theme) || !isDensity(parsed.density)) {
      writeUiSettings(settings);
    }

    return settings;
  } catch {
    return DEFAULT_UI_SETTINGS;
  }
}

export function writeUiSettings(settings: UiSettings) {
  localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function applyTheme(theme: ThemePreference) {
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  document.documentElement.classList.toggle("dark", isDark);
}

export function applyDensity(density: ListDensity) {
  if (density === "compact") {
    document.documentElement.setAttribute("data-density", "compact");
    return;
  }

  document.documentElement.removeAttribute("data-density");
}

function isTheme(value: unknown): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function isDensity(value: unknown): value is ListDensity {
  return value === "comfortable" || value === "compact";
}
