// Shared quote logic — used client-side for the live estimate and
// server-side as the authoritative price when saving to Supabase.

export const SERVICES = [
  { id: "interior", label: "Interior Service", price: 50 },
  { id: "exterior", label: "Exterior Service", price: 50 },
  { id: "full", label: "Full Detail", price: 80, compareAt: 100 },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

// Vehicle size is collected as info only — it does not change the price.
export const SIZE_CLASSES = [
  { id: "sedan", label: "Sedan" },
  { id: "suv", label: "SUV" },
  { id: "truck", label: "Truck" },
  { id: "xl", label: "XL (van / large SUV)" },
] as const;

export type SizeClassId = (typeof SIZE_CLASSES)[number]["id"];

// Estimate is shown as a range of ±15% around the flat service price.
export const RANGE_SPREAD = 0.15;

export type EstimateInput = {
  service: ServiceId | "";
};

export type Estimate = {
  base: number;
  mid: number;
  low: number;
  high: number;
  hasSelection: boolean;
};

export function computeEstimate(input: EstimateInput): Estimate {
  const servicePrice =
    SERVICES.find((s) => s.id === input.service)?.price ?? 0;

  const mid = input.service ? servicePrice : 0;
  const low = Math.round((mid * (1 - RANGE_SPREAD)) / 5) * 5;
  const high = Math.round((mid * (1 + RANGE_SPREAD)) / 5) * 5;

  return {
    base: servicePrice,
    mid: Math.round(mid),
    low,
    high,
    hasSelection: input.service !== "",
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

// Helpers so labels can be resolved from stored ids without duplicating maps.
export const serviceLabel = (id: ServiceId | "") =>
  SERVICES.find((s) => s.id === id)?.label ?? id;
export const sizeClassLabel = (id: SizeClassId | "") =>
  SIZE_CLASSES.find((s) => s.id === id)?.label ?? id;
