import { Resend } from "resend";
import {
  formatCurrency,
  serviceLabel,
  sizeClassLabel,
  type Estimate,
  type ServiceId,
  type SizeClassId,
} from "./quote";

export type QuoteNotification = {
  /** The saved Supabase row id — used as the idempotency key so a retry can't double-send. */
  id?: string;
  name: string;
  email: string;
  phone: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  sizeClass: SizeClassId;
  services: ServiceId[];
  serviceAddress: string;
  notes: string;
  estimate: Estimate;
};

export type ChannelResult =
  | { status: "sent"; id: string | null }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string };

export type NotificationResults = {
  email: ChannelResult;
  sms: ChannelResult;
};

function vehicleString(q: QuoteNotification): string {
  const parts = [q.vehicleYear, q.vehicleMake, q.vehicleModel]
    .map((p) => p?.trim())
    .filter(Boolean);
  return parts.length ? parts.join(" ") : "Not specified";
}

function estimateRange(q: QuoteNotification): string {
  return `${formatCurrency(q.estimate.low)}–${formatCurrency(q.estimate.high)}`;
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

async function sendEmail(q: QuoteNotification): Promise<ChannelResult> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.QUOTE_NOTIFICATION_TO;
    // onboarding@resend.dev is Resend's sandbox sender; it only delivers to the
    // email on your Resend account. Set QUOTE_NOTIFICATION_FROM to a verified
    // domain address for production.
    const from =
      process.env.QUOTE_NOTIFICATION_FROM ||
      "Zero Maintenance <onboarding@resend.dev>";

    if (!apiKey || !to) {
      const missing = [
        !apiKey && "RESEND_API_KEY",
        !to && "QUOTE_NOTIFICATION_TO",
      ]
        .filter(Boolean)
        .join(", ");
      const reason = `${missing} not set`;
      console.warn(`[notifications] Skipping email — ${reason}.`);
      return { status: "skipped", reason };
    }

    const resend = new Resend(apiKey);
    const serviceList = q.services.map((s) => serviceLabel(s)).join(", ");
    const vehicle = vehicleString(q);
    const range = estimateRange(q);

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;background:#0A0A0F;color:#F4F5F8;padding:28px;border-radius:8px">
      <p style="font-family:monospace;letter-spacing:2px;color:#8A90A2;font-size:12px;text-transform:uppercase;margin:0 0 8px">New Quote Request</p>
      <h1 style="font-size:24px;margin:0 0 4px">${q.name}</h1>
      <p style="color:#5A9BFF;font-size:20px;font-weight:bold;margin:8px 0 20px">${range}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#8A90A2;width:130px">Email</td><td style="padding:6px 0"><a style="color:#5A9BFF" href="mailto:${q.email}">${q.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#8A90A2">Phone</td><td style="padding:6px 0"><a style="color:#5A9BFF" href="tel:${q.phone}">${q.phone}</a></td></tr>
        <tr><td style="padding:6px 0;color:#8A90A2">Vehicle</td><td style="padding:6px 0">${vehicle}</td></tr>
        <tr><td style="padding:6px 0;color:#8A90A2">Size class</td><td style="padding:6px 0">${sizeClassLabel(q.sizeClass)}</td></tr>
        <tr><td style="padding:6px 0;color:#8A90A2">Services</td><td style="padding:6px 0">${serviceList}</td></tr>
        <tr><td style="padding:6px 0;color:#8A90A2">Service address</td><td style="padding:6px 0">${q.serviceAddress}</td></tr>
        <tr><td style="padding:6px 0;color:#8A90A2;vertical-align:top">Notes</td><td style="padding:6px 0">${q.notes?.trim() ? q.notes : "—"}</td></tr>
      </table>
      <p style="color:#8A90A2;font-size:12px;margin-top:24px">Estimate is a ±15% range; confirm final price after inspection.</p>
    </div>`;

    const text = [
      `New quote request from ${q.name}`,
      `Estimate: ${range}`,
      `Email: ${q.email}`,
      `Phone: ${q.phone}`,
      `Vehicle: ${vehicle}`,
      `Size class: ${sizeClassLabel(q.sizeClass)}`,
      `Services: ${serviceList}`,
      `Service address: ${q.serviceAddress}`,
      `Notes: ${q.notes?.trim() || "—"}`,
    ].join("\n");

    // Resend SDK returns { data, error } — it does not throw on API errors.
    const { data, error } = await resend.emails.send(
      {
        from,
        to: [to],
        replyTo: q.email,
        subject: `New quote: ${q.name} — ${range}`,
        html,
        text,
      },
      // Idempotency key is tied to the saved row id so a platform retry of the
      // same submission won't send a duplicate email within the 24h window.
      q.id ? { idempotencyKey: `quote-notification/${q.id}` } : undefined,
    );

    if (error) {
      console.error("[notifications] Resend email failed:", error.message);
      return { status: "failed", error: error.message };
    }
    return { status: "sent", id: data?.id ?? null };
  } catch (e) {
    const error = errorMessage(e);
    console.error("[notifications] Resend email threw:", error);
    return { status: "failed", error };
  }
}

async function sendSms(q: QuoteNotification): Promise<ChannelResult> {
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    const to = process.env.QUOTE_NOTIFICATION_SMS_TO;

    if (!sid || !token || !from || !to) {
      const missing = [
        !sid && "TWILIO_ACCOUNT_SID",
        !token && "TWILIO_AUTH_TOKEN",
        !from && "TWILIO_FROM_NUMBER",
        !to && "QUOTE_NOTIFICATION_SMS_TO",
      ]
        .filter(Boolean)
        .join(", ");
      const reason = `${missing} not set`;
      console.warn(`[notifications] Skipping SMS — ${reason}.`);
      return { status: "skipped", reason };
    }

    const serviceList = q.services.map((s) => serviceLabel(s)).join(", ");
    const body = [
      `New Zero Maintenance quote`,
      `${q.name} · ${q.phone}`,
      `${vehicleString(q)} (${sizeClassLabel(q.sizeClass)})`,
      `${serviceList}`,
      `@ ${q.serviceAddress}`,
      `Est ${estimateRange(q)}`,
    ].join("\n");

    const params = new URLSearchParams({ To: to, From: from, Body: body });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      const error = `Twilio ${res.status}: ${detail || res.statusText}`;
      console.error(`[notifications] Twilio SMS failed — ${error}`);
      return { status: "failed", error };
    }

    const data = (await res.json().catch(() => null)) as { sid?: string } | null;
    return { status: "sent", id: data?.sid ?? null };
  } catch (e) {
    const error = errorMessage(e);
    console.error("[notifications] Twilio SMS threw:", error);
    return { status: "failed", error };
  }
}

// Fire both notifications. The ENTIRE body is wrapped so nothing — env reads,
// client construction, or the sends themselves — can ever throw to the caller.
// Each channel is isolated so one failing never affects the other or the quote
// submission. Awaited (not fire-and-forget) so the work completes before a
// serverless function is frozen.
export async function sendQuoteNotifications(
  q: QuoteNotification,
): Promise<NotificationResults> {
  try {
    const [email, sms] = await Promise.all([sendEmail(q), sendSms(q)]);
    return { email, sms };
  } catch (e) {
    // sendEmail/sendSms already swallow their own errors, so this is a
    // last-resort guard that should effectively never run.
    const error = errorMessage(e);
    console.error("[notifications] Unexpected notification failure:", error);
    return {
      email: { status: "failed", error },
      sms: { status: "failed", error },
    };
  }
}
