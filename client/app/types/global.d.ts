declare global {
  type CurrentUser = {
    username: string;
    email: string;
    dueDateReminder: boolean;
    dailyDigest: boolean;
  };

  type SelectOption = {
    value: string;
    label: string;
    [key: string]: unknown;
  };
}

export {};
