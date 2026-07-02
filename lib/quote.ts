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

export type EstimateInput = {
  service: ServiceId | "";
};

export type Estimate = {
  // Flat price for the selected package.
  price: number;
  // Original (pre-launch) price, if the package has launch pricing — else null.
  compareAt: number | null;
  hasSelection: boolean;
};

export function computeEstimate(input: EstimateInput): Estimate {
  const svc = SERVICES.find((s) => s.id === input.service);

  return {
    price: svc?.price ?? 0,
    compareAt: svc && "compareAt" in svc ? svc.compareAt : null,
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
