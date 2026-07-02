"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendQuoteNotifications } from "@/lib/notifications";
import {
  computeEstimate,
  SERVICES,
  SIZE_CLASSES,
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
  service: string;
  addressStreet: string;
  addressCity: string;
  addressZip: string;
  notes: string;
};

export type SubmitState = { error: string | null };

const validServiceIds = new Set(SERVICES.map((s) => s.id));
const validSizeIds = new Set(SIZE_CLASSES.map((s) => s.id));

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

  const service = validServiceIds.has(payload.service as ServiceId)
    ? (payload.service as ServiceId)
    : "";
  if (!service) {
    return { error: "Choose a service." };
  }

  const sizeClass = validSizeIds.has(payload.sizeClass as SizeClassId)
    ? (payload.sizeClass as SizeClassId)
    : "";
  if (!sizeClass) return { error: "Choose a vehicle size class." };

  const street = payload.addressStreet?.trim();
  const city = payload.addressCity?.trim();
  const zip = payload.addressZip?.trim();
  if (!street || !city || !zip) {
    return { error: "A service address (street, city, and zip) is required." };
  }
  const serviceAddress = `${street}, ${city} ${zip}`;

  // Server recomputes the estimate so the saved price can't be tampered with.
  const estimate = computeEstimate({ service, sizeClass });

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
    service,
    service_address: serviceAddress,
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
      service,
      serviceAddress,
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
