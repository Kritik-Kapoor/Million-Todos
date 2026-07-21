import { apiFetch } from "@/lib/utils/apiClient";
import type {
  LabelItem,
  UpdateAccountPayload,
  NotificationPreferences,
} from "./types";

//TODO: Right now this api is not being used anywhere, but keeping it here for future reference.
export const fetchCurrentUser = (signal?: AbortSignal) =>
  apiFetch<CurrentUser>("/auth/me", {
    signal,
    fallbackErrorMessage: "Failed to fetch current user",
  });

export const fetchLabels = (signal?: AbortSignal) =>
  apiFetch<LabelItem[]>("/labels", {
    signal,
    fallbackErrorMessage: "Failed to fetch labels",
  });

export const createLabel = (data: Pick<LabelItem, "name" | "color">) =>
  apiFetch<LabelItem>("/labels", {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to create label",
  });

export const updateLabel = (
  labelId: string,
  data: Partial<Pick<LabelItem, "name" | "color">>,
) =>
  apiFetch<LabelItem>(`/labels/${labelId}`, {
    method: "PATCH",
    body: data,
    fallbackErrorMessage: "Failed to update label",
  });

export const deleteLabel = (labelId: string) =>
  apiFetch<null>(`/labels/${labelId}`, {
    method: "DELETE",
    fallbackErrorMessage: "Failed to delete label",
    responseType: "envelope",
  });

export const updateAccount = (data: UpdateAccountPayload) =>
  apiFetch<CurrentUser>("/auth/me", {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to update account",
  });

export const updateUserPreferences = (data: NotificationPreferences) =>
  apiFetch<CurrentUser>("/auth/me/preferences", {
    method: "POST",
    body: data,
    fallbackErrorMessage: "Failed to update user preferences",
  });

export const deleteAllTodos = () =>
  apiFetch<null>("/todos/all", {
    method: "DELETE",
    fallbackErrorMessage: "Failed to delete all todos",
    responseType: "envelope",
  });

export const sendVerificationEmail = () =>
  apiFetch<null>("/auth/send-verification-mail", {
    method: "POST",
    fallbackErrorMessage: "Failed to send verification mail",
    responseType: "envelope",
  });

export const deleteAccount = () =>
  apiFetch<null>("/auth/delete-account", {
    method: "DELETE",
    fallbackErrorMessage: "Failed to delete account",
    responseType: "envelope",
  });
