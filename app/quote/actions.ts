"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendQuoteNotifications } from "@/lib/notifications";
import {
  computeEstimate,
  CONDITIONS,
  SERVICES,
  SIZE_CLASSES,
  type ConditionId,
  type ServiceId,
  type SizeClassId,
} from "@/lib/quote";

export type QuotePayload = {
  name: string;
  email: string;
  phone: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  sizeClass: string;
  services: string[];
  condition: string;
  notes: string;
};

export type SubmitState = { error: string | null };

const validServiceIds = new Set(SERVICES.map((s) => s.id));
const validSizeIds = new Set(SIZE_CLASSES.map((s) => s.id));
const validConditionIds = new Set(CONDITIONS.map((c) => c.id));

export async function submitQuote(
  _prev: SubmitState,
  payload: QuotePayload,
): Promise<SubmitState> {
  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const phone = payload.phone?.trim();

  if (!name || !email || !phone) {
    return { error: "Name, email, and phone are required." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const services = (payload.services ?? []).filter((s): s is ServiceId =>
    validServiceIds.has(s as ServiceId),
  );
  if (services.length === 0) {
    return { error: "Select at least one service." };
  }

  const sizeClass = validSizeIds.has(payload.sizeClass as SizeClassId)
    ? (payload.sizeClass as SizeClassId)
    : "";
  const condition = validConditionIds.has(payload.condition as ConditionId)
    ? (payload.condition as ConditionId)
    : "";

  if (!sizeClass) return { error: "Choose a vehicle size class." };
  if (!condition) return { error: "Choose the paint condition." };

  // Server recomputes the estimate so the saved price can't be tampered with.
  const estimate = computeEstimate({ services, sizeClass, condition });

  // Generate the row id ourselves so we know it without a SELECT (RLS allows
  // INSERT only). This id also seeds the notification idempotency key, so a
  // platform retry of the same submission can't double-send.
  const id = crypto.randomUUID();

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.from("quote_requests").insert({
    id,
    name,
    email,
    phone,
    vehicle_year: payload.vehicleYear?.trim() || null,
    vehicle_make: payload.vehicleMake?.trim() || null,
    vehicle_model: payload.vehicleModel?.trim() || null,
    size_class: sizeClass,
    services,
    condition,
    notes: payload.notes?.trim() || null,
    estimate_low: estimate.low,
    estimate_high: estimate.high,
  });

  if (error) {
    console.error("Failed to save quote request:", error.message);
    return {
      error:
        "Something went wrong saving your request. Please try again or call us.",
    };
  }

  // Notify the business (email + SMS). Second layer of isolation on top of the
  // guards inside sendQuoteNotifications: a delivery failure must never stop a
  // saved quote from reaching /quote/success.
  try {
    await sendQuoteNotifications({
      id,
      name,
      email,
      phone,
      vehicleYear: payload.vehicleYear?.trim() ?? "",
      vehicleMake: payload.vehicleMake?.trim() ?? "",
      vehicleModel: payload.vehicleModel?.trim() ?? "",
      sizeClass,
      services,
      condition,
      notes: payload.notes?.trim() ?? "",
      estimate,
    });
  } catch (notifyError) {
    console.error(
      "Quote saved but notifications failed:",
      notifyError instanceof Error ? notifyError.message : notifyError,
    );
  }

  redirect("/quote/success");
}
