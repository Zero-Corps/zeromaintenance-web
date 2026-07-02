# Manual testing checklist

Minimal checklist for the quote-notification path. No framework — just the
smoke script (`npm run test:notify`) and a few real-world checks.

## Notification smoke test

- [ ] Run `npm run test:notify` with keys set — confirm both channels report **SENT**
- [ ] Check the destination inbox — email arrived, `replyTo` is the customer's
      address, and the HTML renders
- [ ] Check the destination phone — SMS arrived and is readable

### Provider gotchas

- [ ] **Resend:** `onboarding@resend.dev` only delivers to your own Resend
      account email. Verify a domain and set `QUOTE_NOTIFICATION_FROM` to an
      address on it for real sending.
- [ ] **Twilio:** trial accounts can only send to **verified** numbers and
      prepend a trial prefix to the message until the account is upgraded.

## Failure-isolation test (the important one)

This proves a notification outage can never 500 a saved quote.

- [ ] Temporarily blank a notification env var (e.g. clear `RESEND_API_KEY` or
      `TWILIO_AUTH_TOKEN`) in `.env.local` and restart the dev server
- [ ] Submit a **real** quote through `/quote`
- [ ] Confirm it still **saves to Supabase** (row appears in Table Editor →
      `quote_requests`) **and** redirects to `/quote/success`
- [ ] Confirm the server logs show a skipped/failed notification warning — but
      no error page for the user
- [ ] Restore the env var when done

## Reading `npm run test:notify` output

Each channel prints exactly one status:

| Status    | Meaning                                                             |
| --------- | ------------------------------------------------------------------- |
| `SENT`    | Provider accepted it; shows the returned id (Resend email / Twilio SID) |
| `SKIPPED` | That channel's env vars aren't set (names are listed) — not an error |
| `FAILED`  | A configured channel errored; the message is printed                |

Exit code is **0** if nothing failed (including all-skipped), and **1** only if
a configured channel actually errored.
