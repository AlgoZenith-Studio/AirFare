/**
 * Public landing mock data. Mirrors the shape of GET /api/v1/public/* responses
 * so this page can switch to the live API with no component changes.
 *
 * MONEY IS INTEGER PAISE (1 INR = 100 paise) per Non-Negotiable Rule 7.
 * Index values are unitless points where 100 = prices in September 2026.
 */

export interface RouteSector {
  id: string;
  label: string;
  paxShare: string;
  baseFarePaise: number;
  totalOutlayPaise: number;
  change24h: string;
}

export const ROUTES: RouteSector[] = [
  { id: 'DEL-BOM', label: 'Delhi → Mumbai', paxShare: '12.4%', baseFarePaise: 485000, totalOutlayPaise: 547000, change24h: '+1.4%' },
  { id: 'DEL-BLR', label: 'Delhi → Bengaluru', paxShare: '9.8%', baseFarePaise: 540000, totalOutlayPaise: 612000, change24h: '+4.2%' },
  { id: 'BOM-BLR', label: 'Mumbai → Bengaluru', paxShare: '7.6%', baseFarePaise: 360000, totalOutlayPaise: 402000, change24h: '-0.8%' },
  { id: 'DEL-CCU', label: 'Delhi → Kolkata', paxShare: '5.2%', baseFarePaise: 420000, totalOutlayPaise: 474000, change24h: '+0.5%' },
  { id: 'BLR-HYD', label: 'Bengaluru → Hyderabad', paxShare: '4.3%', baseFarePaise: 285000, totalOutlayPaise: 318000, change24h: '+1.1%' },
];

/** How fares move as the trip gets closer. Booking earlier is cheaper. */
export const BOOKING_WINDOWS = {
  'T+1': { label: 'Tomorrow', multiplier: 1.85 },
  'T+7': { label: 'In a week', multiplier: 1.35 },
  'T+15': { label: 'In 2 weeks', multiplier: 1.0 },
  'T+30': { label: 'In a month', multiplier: 0.88 },
} as const;

export type BookingWindow = keyof typeof BOOKING_WINDOWS;

export const HEADLINE = {
  afi: 104.2,
  afiChange: '+3.8% this month',
  tctAfi: 116.8,
  tctAfiChange: '+6.1% this month',
  dripGap: '+12.6%',
  asOf: '27 Sep 2026',
  updatedAt: 'Updated daily at 7:00 PM IST',
  coverage: '98% of flights checked',
} as const;

/** One typical Delhi -> Mumbai ticket, split into what you actually pay for. */
export interface FarePart {
  key: string;
  label: string;
  paise: number;
  seg: 1 | 2 | 3 | 4 | 5;
}

export const FARE_BREAKDOWN: FarePart[] = [
  { key: 'base', label: 'Advertised fare', paise: 485000, seg: 1 },
  { key: 'fuel', label: 'Fuel charge', paise: 14000, seg: 2 },
  { key: 'airport', label: 'Airport fees', paise: 17600, seg: 3 },
  { key: 'gst', label: 'GST', paise: 15400, seg: 4 },
  { key: 'booking', label: 'Booking fee', paise: 15000, seg: 5 },
];
