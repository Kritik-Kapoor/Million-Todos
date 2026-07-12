export interface SendEmailOptions {
  to: string[];
  subject: string;
  html: string;
}

export interface DueReminderTodo {
  id: string;
  title: string;
  dueDate: Date;
}

export type BasicEmailOptions = {
  to: string;
  username: string;
};

export type SendDueReminderOptions = BasicEmailOptions & {
  todos: DueReminderTodo[];
};

export type SendVerificationEmailOptions = BasicEmailOptions & {
  verificationToken: string;
};

export type SendPasswordResetEmailOptions = BasicEmailOptions & {
  passwordResetToken: string;
};
