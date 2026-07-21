import type { CookieOptions, Response } from "express";

export const AUTH_COOKIE_NAME = "million-todos-token";

export function getAuthCookieOptions(
  overrides: CookieOptions = {},
): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";

  const options: CookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    path: "/",
    ...overrides,
  };

  if (isProduction) {
    options.domain = process.env.COOKIE_DOMAIN ?? ".kritikkapoor.in";
  }

  return options;
}

export function setAuthCookie(res: Response, token: string) {
  return res.cookie(
    AUTH_COOKIE_NAME,
    token,
    getAuthCookieOptions({
      maxAge: 1000 * 60 * 60 * 24 * 7,
    }),
  );
}

export function clearAuthCookie(res: Response) {
  return res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
}
