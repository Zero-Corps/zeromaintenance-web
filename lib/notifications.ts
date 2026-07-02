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
  service: ServiceId;
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

function priceString(q: QuoteNotification): string {
  const price = formatCurrency(q.estimate.price);
  return q.estimate.compareAt
    ? `${price} (launch price — reg. ${formatCurrency(q.estimate.compareAt)})`
    : price;
}

function submittedAt(): string {
  // Wise County, TX is Central time — stamp the alert in the operator's zone.
  return new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "medium",
    timeStyle: "short",
  });
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
    const serviceName = serviceLabel(q.service);
    const vehicle = vehicleString(q);
    const price = priceString(q);
    const when = submittedAt();
    const notes = q.notes?.trim() ? q.notes : "—";
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      q.serviceAddress,
    )}`;

    const row = (label: string, value: string) =>
      `<tr><td style="padding:7px 0;color:#8A90A2;width:150px;vertical-align:top">${label}</td><td style="padding:7px 0;vertical-align:top">${value}</td></tr>`;

    const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#F4F5F8;padding:28px;border-radius:8px">
      <p style="font-family:monospace;letter-spacing:2px;color:#8A90A2;font-size:12px;text-transform:uppercase;margin:0 0 8px">New Quote Request</p>
      <h1 style="font-size:24px;margin:0 0 4px">${q.name}</h1>
      <p style="color:#5A9BFF;font-size:20px;font-weight:bold;margin:8px 0 4px">${serviceName} — ${price}</p>
      <p style="color:#8A90A2;font-size:12px;margin:0 0 20px">Submitted ${when} (CT)</p>

      <p style="font-family:monospace;letter-spacing:1px;color:#8A90A2;font-size:11px;text-transform:uppercase;margin:0 0 4px">Customer</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 18px">
        ${row("Name", q.name)}
        ${row("Email", `<a style="color:#5A9BFF" href="mailto:${q.email}">${q.email}</a>`)}
        ${row("Phone", `<a style="color:#5A9BFF" href="tel:${q.phone}">${q.phone}</a>`)}
        ${row("Service address", `${q.serviceAddress} · <a style="color:#5A9BFF" href="${mapsUrl}">map</a>`)}
      </table>

      <p style="font-family:monospace;letter-spacing:1px;color:#8A90A2;font-size:11px;text-transform:uppercase;margin:0 0 4px">Vehicle &amp; service</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 18px">
        ${row("Vehicle", vehicle)}
        ${row("Size class", sizeClassLabel(q.sizeClass))}
        ${row("Service", serviceName)}
        ${row("Price", price)}
        ${row("Notes", notes)}
      </table>

      ${q.id ? `<p style="color:#8A90A2;font-size:11px;margin-top:8px">Reference: ${q.id}</p>` : ""}
      <p style="color:#8A90A2;font-size:12px;margin-top:16px">Reply to this email to reach ${q.name} directly. Final total is confirmed after inspection.</p>
    </div>`;

    const text = [
      `NEW QUOTE REQUEST`,
      `Submitted ${when} (CT)`,
      ``,
      `— Customer —`,
      `Name: ${q.name}`,
      `Email: ${q.email}`,
      `Phone: ${q.phone}`,
      `Service address: ${q.serviceAddress}`,
      ``,
      `— Vehicle & service —`,
      `Vehicle: ${vehicle}`,
      `Size class: ${sizeClassLabel(q.sizeClass)}`,
      `Service: ${serviceName}`,
      `Price: ${price}`,
      `Notes: ${notes}`,
      q.id ? `` : null,
      q.id ? `Reference: ${q.id}` : null,
    ]
      .filter((line) => line !== null)
      .join("\n");

    // Resend SDK returns { data, error } — it does not throw on API errors.
    const { data, error } = await resend.emails.send(
      {
        from,
        to: [to],
        replyTo: q.email,
        subject: `New quote: ${q.name} — ${serviceName} ${formatCurrency(q.estimate.price)}`,
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

    const body = [
      `New Zero Maintenance quote`,
      `${q.name} · ${q.phone}`,
      `${vehicleString(q)} (${sizeClassLabel(q.sizeClass)})`,
      `${serviceLabel(q.service)} — ${formatCurrency(q.estimate.price)}`,
      `@ ${q.serviceAddress}`,
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
