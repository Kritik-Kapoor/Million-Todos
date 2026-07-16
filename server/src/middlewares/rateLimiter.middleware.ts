import { rateLimit } from "express-rate-limit";

type RateLimiterMiddlewareOptions = {
  limit?: number;
  windowMs?: number;
};

function rateLimiterMiddleware({
  limit = 10,
  windowMs = 15 * 60 * 1000,
}: RateLimiterMiddlewareOptions) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
  });
}

export default rateLimiterMiddleware;
