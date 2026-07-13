const DURATION_MULTIPLIERS_MS = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

/** Parse env-style durations like "15m", "1h", "7d" into milliseconds. */
export function parseDurationMs(value: string, fallback = "15m"): number {
  const duration = value.trim() || fallback;
  const match = duration.match(/^(\d+)(ms|s|m|h|d)$/);
  if (!match) {
    throw new Error(`Invalid duration format: "${duration}"`);
  }

  const amount = Number(match[1]);
  const unit = match[2] as keyof typeof DURATION_MULTIPLIERS_MS;
  return amount * DURATION_MULTIPLIERS_MS[unit];
}
