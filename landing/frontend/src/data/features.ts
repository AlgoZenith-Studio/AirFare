import type { LucideIcon } from 'lucide-react';
import { CalendarDays, Receipt, Route, Clock, ChartColumn, ShieldCheck } from 'lucide-react';
import { BOOKING_WINDOWS, FARE_BREAKDOWN, HEADLINE, ROUTES } from './mockData';
import { paiseToINR, scalePaise } from '../lib/format';

/**
 * What AeroFareX gives its users, in plain language.
 *
 * `media` is the demo for each feature. Leave it null to show the written
 * explanation card; set it to a file in /public (e.g. '/demos/daily-index.mp4',
 * '.webm' or '.png') and the panel plays it instead. No component changes needed.
 *
 * Examples are worked out from the same mock data the rest of the page uses,
 * so the numbers always agree with the other sections.
 */
export interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string; // one line, shown in the list
  audience: string;
  details: string; // the plain-language explanation in the panel
  points: [string, string, string];
  example: string;
  media: string | null;
}

// ---- numbers used in the examples
const fareTotal = FARE_BREAKDOWN.reduce((sum, p) => sum + p.paise, 0);
const fareBase = FARE_BREAKDOWN[0].paise;
const delBom = ROUTES[0];
const delBlr = ROUTES[1];
const earlySaving =
  scalePaise(delBom.totalOutlayPaise, BOOKING_WINDOWS['T+1'].multiplier) -
  scalePaise(delBom.totalOutlayPaise, BOOKING_WINDOWS['T+30'].multiplier);
const routeShare = ROUTES.reduce((sum, r) => sum + parseFloat(r.paxShare), 0).toFixed(1);
const indexRise = Math.round(HEADLINE.afi - 100);

export const FEATURES: Feature[] = [
  {
    id: 'daily-index',
    icon: CalendarDays,
    title: 'A fresh airfare index, every day',
    description:
      'We publish India’s airfare index daily, not once a month. You always see where prices stand today.',
    audience: 'For everyone',
    details:
      'Every evening we publish one number that shows how airfares in India have moved. 100 means prices are the same as in September 2026. Above 100, flying costs more than it did then. Below 100, it costs less.',
    points: [
      'A new number every day, not once a month',
      'Covers India’s five busiest routes and the main airlines',
      'Every past day stays on record, so you can compare',
    ],
    example: `Today the index is ${HEADLINE.afi}. That means fares are about ${indexRise}% higher than in September 2026.`,
    media: null,
  },
  {
    id: 'full-price',
    icon: Receipt,
    title: 'The full price, every fee included',
    description:
      'We add up the fare, fuel charge, airport fees, GST and booking fees, so you see what a ticket really costs.',
    audience: 'For travellers',
    details:
      'The price you see when you search is rarely the price you pay. We record the final amount at checkout and list every part of it separately, so nothing is left out.',
    points: [
      'Fare, fuel charge, airport fees, GST and booking fee, each shown on its own',
      'A second index that follows the total you actually pay',
      'The gap between the two is shown every day',
    ],
    example: `Delhi → Mumbai: ${paiseToINR(fareBase)} advertised, ${paiseToINR(fareTotal)} at checkout. That is ${paiseToINR(fareTotal - fareBase)} more than the price shown first.`,
    media: null,
  },
  {
    id: 'routes',
    icon: Route,
    title: 'Prices for India’s busiest routes',
    description:
      'Check Delhi, Mumbai, Bengaluru, Kolkata and Hyderabad routes side by side, with today’s change.',
    audience: 'For travellers',
    details:
      'Pick any of the five routes that most people in India fly and see today’s price next to yesterday’s. The routes are Delhi–Mumbai, Delhi–Bengaluru, Mumbai–Bengaluru, Delhi–Kolkata and Bengaluru–Hyderabad.',
    points: [
      'The advertised price and the full price for each route',
      'How much each route changed since yesterday',
      `Together these routes carry ${routeShare}% of all domestic passengers`,
    ],
    example: `${delBlr.label} is ${delBlr.change24h.startsWith('-') ? 'down' : 'up'} ${delBlr.change24h.replace(/^[+-]/, '')} since yesterday.`,
    media: null,
  },
  {
    id: 'when-to-book',
    icon: Clock,
    title: 'Know the best time to book',
    description:
      'See how the price changes if you book tomorrow, next week or next month, and how much you can save.',
    audience: 'For travellers',
    details:
      'The same seat can cost very different amounts depending on how early you book. We check every route for trips tomorrow, in a week, in two weeks and in a month, and show you the difference in rupees.',
    points: [
      'Prices for four booking times, side by side',
      'The money you save by booking early, worked out for you',
      'Based on real prices we collect every day',
    ],
    example: `On ${delBom.label}, booking a month ahead instead of for tomorrow saves about ${paiseToINR(earlySaving)}.`,
    media: null,
  },
  {
    id: 'why-it-moved',
    icon: ChartColumn,
    title: 'See why prices went up or down',
    description:
      'Every daily change is broken down by route, airline, booking time and cause, like fuel costs or demand.',
    audience: 'For analysts',
    details:
      'When the index moves, we show exactly where the change came from: which routes, which airlines and which booking times pushed prices, and whether fuel costs or higher demand were behind it.',
    points: [
      'Every daily change split into clear parts',
      'The parts always add up exactly to the total change',
      'Makes festival and holiday price jumps easy to spot early',
    ],
    example: 'For example: “Delhi routes added 0.6 points today, mostly because of higher demand.”',
    media: null,
  },
  {
    id: 'checkable',
    icon: ShieldCheck,
    title: 'Every number can be checked and downloaded',
    description:
      'Each figure links back to the original price it came from, and the full data can be downloaded for your own work.',
    audience: 'For government & researchers',
    details:
      'Every number we publish can be traced back to the original prices it was built from. Nothing is changed quietly: if a figure is ever corrected, the earlier version stays on record. The full data is free to download.',
    points: [
      'Every figure links to the prices behind it',
      'Corrections are recorded, never hidden',
      'Download as a spreadsheet (CSV) or in SDMX, the format statistics offices use',
    ],
    example: 'Anyone can rebuild a past day’s number from the stored prices and get exactly the same result.',
    media: null,
  },
];
