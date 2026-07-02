/**
 * Smoke test for the quote-notification path.
 *
 *   npm run test:notify
 *   # or: npx tsx scripts/test-notifications.ts
 *
 * Builds a realistic fake quote and calls sendQuoteNotifications() directly —
 * no need to submit the real form. Per channel it prints SENT (with the
 * provider's returned id), SKIPPED (naming the missing env vars), or FAILED
 * (with the error). Exits 0 even if a channel is skipped; exits 1 only if a
 * configured channel actually errors.
 */

import { sendQuoteNotifications } from "../lib/notifications";
import { computeEstimate } from "../lib/quote";

// Load .env.local so the script sees the same keys the app uses (Node >= 20.6).
const loadEnvFile = (
  process as unknown as { loadEnvFile?: (path?: string) => void }
).loadEnvFile;
try {
  loadEnvFile?.(".env.local");
} catch {
  console.warn(
    "[test:notify] No .env.local found (or unreadable) — reading env from the current shell.\n",
  );
}

async function main() {
  const service = "full" as const;
  const sizeClass = "suv" as const;

  const estimate = computeEstimate({ service });

  const result = await sendQuoteNotifications({
    id: `smoke-test-${Date.now()}`,
    name: "Test Customer",
    email: "delivered@resend.dev",
    phone: "+15555550123",
    vehicleYear: "2021",
    vehicleMake: "Toyota",
    vehicleModel: "4Runner",
    sizeClass,
    service,
    serviceAddress: "123 Main St, Decatur 76234",
    notes: "Smoke test — please ignore.",
    estimate,
  });

  console.log("\nQuote-notification smoke test");
  console.log("─────────────────────────────");

  const channels: [string, (typeof result)["email"]][] = [
    ["EMAIL", result.email],
    ["SMS  ", result.sms],
  ];

  let hasFailure = false;
  for (const [label, channel] of channels) {
    if (channel.status === "sent") {
      console.log(`${label}  SENT     (id: ${channel.id ?? "n/a"})`);
    } else if (channel.status === "skipped") {
      console.log(`${label}  SKIPPED  (${channel.reason})`);
    } else {
      hasFailure = true;
      console.log(`${label}  FAILED   (${channel.error})`);
    }
  }

  console.log("─────────────────────────────");
  if (hasFailure) {
    console.log("Result: at least one configured channel errored.\n");
    process.exit(1);
  }
  console.log("Result: no configured channel errored.\n");
  process.exit(0);
}

main().catch((e) => {
  // sendQuoteNotifications is designed never to throw; this is a final guard.
  console.error("[test:notify] Unexpected error:", e);
  process.exit(1);
});
