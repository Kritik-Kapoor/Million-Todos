export const AUTH_COOKIE_NAME = "million-todos-token";
export function getAuthCookieOptions(overrides = {}) {
    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        path: "/",
        ...overrides,
    };
    // Domain is production-only. On localhost, setting domain breaks clearCookie
    // because the browser stores a host-only cookie instead.
    if (isProduction) {
        options.domain = process.env.COOKIE_DOMAIN ?? ".kritikkapoor.in";
    }
    return options;
}
export function setAuthCookie(res, token) {
    return res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions({
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }));
}
export function clearAuthCookie(res) {
    return res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
}
