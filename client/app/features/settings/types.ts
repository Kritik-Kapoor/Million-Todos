export type LabelItem = {
  id: string;
  name: string;
  color: string;
};

export type SettingsTabKey =
  | "labels"
  | "account"
  | "appearance"
  | "notifications"
  | "data";

export type UpdateAccountPayload = {
  username: string;
  password?: string;
};

export type NotificationPreferences = Pick<CurrentUser, "dueDateReminder">;

export type ThemePreference = "light" | "dark" | "system";

export type ListDensity = "comfortable" | "compact";

export type UiSettings = {
  theme: ThemePreference;
  density: ListDensity;
};
