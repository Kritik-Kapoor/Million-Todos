declare global {
  type CurrentUser = {
    username: string;
    email: string;
    dueDateReminder: boolean;
    emailReminder: boolean;
    isEmailVerified: boolean;
  };

  type SelectOption = {
    value: string;
    label: string;
    [key: string]: unknown;
  };
}

export {};
