import { apiFetch } from "@/lib/utils/apiClient";
import type { User } from "./types";

export const loginUser = (data: { email: string; password: string }) =>
  apiFetch<User>("/auth/login", {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Invalid credentials",
  });

export const logoutUser = () =>
  apiFetch<null>("/auth/logout", {
    method: "POST",
    fallbackErrorMessage: "Failed to logout",
  });

export const getUser = () =>
  apiFetch<User>("/auth/me", {
    method: "GET",
    fallbackErrorMessage: "Failed to get user",
  });

export const registerUser = (data: {
  username: string;
  email: string;
  password: string;
}) =>
  apiFetch<User>("/auth/register", {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to register",
  });

export const getResetPasswordLink = (email: string) =>
  apiFetch<null>("/auth/forgot-password", {
    method: "POST",
    body: { email },
    fallbackErrorMessage: "Failed to reset password",
  });

export const resetPassword = (data: {
  resetPasswordToken: string;
  newPassword: string;
  confirmPassword: string;
}) =>
  apiFetch<null>("/auth/reset-password", {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to reset password",
  });
