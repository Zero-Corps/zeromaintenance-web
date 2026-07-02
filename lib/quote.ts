// Shared quote logic — used client-side for the live estimate and
// server-side as the authoritative price when saving to Supabase.

export const SERVICES = [
  { id: "exterior", label: "Exterior Detail", price: 149 },
  { id: "interior", label: "Interior Detail", price: 129 },
  { id: "ceramic", label: "Ceramic Coating", price: 699 },
  { id: "correction", label: "Paint Correction", price: 349 },
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export const SIZE_CLASSES = [
  { id: "sedan", label: "Sedan", multiplier: 1.0 },
  { id: "suv", label: "SUV", multiplier: 1.2 },
  { id: "truck", label: "Truck", multiplier: 1.3 },
  { id: "xl", label: "XL (van / large SUV)", multiplier: 1.5 },
] as const;

export type SizeClassId = (typeof SIZE_CLASSES)[number]["id"];

export const CONDITIONS = [
  { id: "good", label: "Good", surcharge: 0 },
  { id: "fair", label: "Fair", surcharge: 0.1 },
  { id: "rough", label: "Rough", surcharge: 0.25 },
] as const;

export type ConditionId = (typeof CONDITIONS)[number]["id"];

// Estimate is shown as a range of ±15% around the computed midpoint.
export const RANGE_SPREAD = 0.15;

export type EstimateInput = {
  services: ServiceId[];
  sizeClass: SizeClassId | "";
  condition: ConditionId | "";
};

export type Estimate = {
  base: number;
  mid: number;
  low: number;
  high: number;
  hasSelection: boolean;
};

export function computeEstimate(input: EstimateInput): Estimate {
  const base = input.services.reduce((sum, id) => {
    const service = SERVICES.find((s) => s.id === id);
    return sum + (service?.price ?? 0);
  }, 0);

  const sizeMultiplier =
    SIZE_CLASSES.find((s) => s.id === input.sizeClass)?.multiplier ?? 1;
  const conditionSurcharge =
    CONDITIONS.find((c) => c.id === input.condition)?.surcharge ?? 0;

  const mid = base * sizeMultiplier * (1 + conditionSurcharge);
  const low = Math.round((mid * (1 - RANGE_SPREAD)) / 5) * 5;
  const high = Math.round((mid * (1 + RANGE_SPREAD)) / 5) * 5;

  return {
    base,
    mid: Math.round(mid),
    low,
    high,
    hasSelection: input.services.length > 0,
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
export const serviceLabel = (id: ServiceId) =>
  SERVICES.find((s) => s.id === id)?.label ?? id;
export const sizeClassLabel = (id: SizeClassId | "") =>
  SIZE_CLASSES.find((s) => s.id === id)?.label ?? id;
export const conditionLabel = (id: ConditionId | "") =>
  CONDITIONS.find((c) => c.id === id)?.label ?? id;
