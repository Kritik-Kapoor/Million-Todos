import type { ApiErrorResponse, ApiResponse } from "@/types/api";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  fallbackErrorMessage?: string;
  responseType?: "data" | "envelope";
};

export async function apiFetch<TData>(
  path: string,
  options?: ApiFetchOptions & { responseType?: "data" },
): Promise<TData>;

export async function apiFetch<TData>(
  path: string,
  options: ApiFetchOptions & { responseType: "envelope" },
): Promise<ApiResponse<TData>>;

export async function apiFetch<TData>(
  path: string,
  {
    body,
    fallbackErrorMessage = "Request failed",
    headers,
    responseType = "data",
    ...init
  }: ApiFetchOptions = {},
): Promise<TData | ApiResponse<TData>> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: init.credentials ?? "include",
    headers: {
      Accept: "application/json",
      ...(body !== undefined && { "Content-Type": "application/json" }),
      ...headers,
    },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });

  const json = (await response.json().catch(() => null)) as
    | ApiResponse<TData>
    | ApiErrorResponse
    | null;

  if (!response.ok || !json) {
    throw new Error(json?.message ?? fallbackErrorMessage);
  }

  if (responseType === "envelope") {
    return json as ApiResponse<TData>;
  }

  if (json.success === false) {
    throw new Error(json.message ?? fallbackErrorMessage);
  }

  return json.data;
}
