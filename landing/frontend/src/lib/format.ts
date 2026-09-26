/**
 * Money is stored and passed around as integer paise (1 INR = 100 paise),
 * per AeroFareX Non-Negotiable Rule 7. Formatting to rupees happens ONLY here,
 * at the render boundary.
 */

export function paiseToINR(paise: number, withDecimals = false): string {
  const rupees = paise / 100;
  return (
    '₹' +
    rupees.toLocaleString('en-IN', {
      minimumFractionDigits: withDecimals ? 2 : 0,
      maximumFractionDigits: withDecimals ? 2 : 0,
    })
  );
}

/** Scale a paise amount by a multiplier and round back to whole paise. */
export function scalePaise(paise: number, multiplier: number): number {
  return Math.round(paise * multiplier);
}

/** The environment-driven URL of the sovereign analyst portal (never hardcoded). */
export const PORTAL_URL: string =
  (import.meta.env.VITE_PORTAL_URL as string | undefined) ?? 'http://localhost:3000';
