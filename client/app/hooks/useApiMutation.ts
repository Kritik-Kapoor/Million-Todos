"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiMutationOptions {
  method?: Method;
  onSuccess?: (data: unknown) => void;
  onError?: (data: unknown) => void;
}

interface ApiMutationResult<TBody> {
  mutate: (body?: TBody) => Promise<Response | null>;
  loading: boolean;
}

export function useApiMutation<TBody = void>(
  path: string,
  options: ApiMutationOptions = {},
): ApiMutationResult<TBody> {
  const { method = "POST", onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const mutate = useCallback(
    async (body?: TBody): Promise<Response | null> => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}${path}`, {
          method,
          headers: {
            Accept: "application/json",
            ...(body !== undefined && {
              "Content-Type": "application/json",
            }),
          },
          credentials: "include",
          ...(body !== undefined && { body: JSON.stringify(body) }),
        });

        const json = await response.json().catch(() => null);

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return null;
          }
          onError?.(json);
        } else {
          onSuccess?.(json);
        }

        return response;
      } catch (err) {
        onError?.(null);
        console.error(`[useApiMutation] ${method} ${path}`, err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [method, onError, onSuccess, path, router],
  );

  return { mutate, loading };
}
