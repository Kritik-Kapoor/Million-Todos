declare global {
  type CurrentUser = {
    username: string;
    email: string;
    dueDateReminder: boolean;
    dailyDigest: boolean;
  };
}

export {};
