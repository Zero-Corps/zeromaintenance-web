# Zero Maintenance — Mobile Auto Detailing

Marketing site + quote-request tool for **Zero Maintenance**, a mobile car
detailing venture by [ZeroCorps LLC](https://zerocorps.org) serving Wise County
and surrounding DFW communities. Visitors get an instant client-side estimate
and submit a quote request that's saved to Supabase for the business to follow
up on.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Supabase** (Postgres) for storing quote requests
- Deploys to **Vercel**

## Pages

| Route            | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `/`              | Landing — hero, services, process, quote CTA        |
| `/quote`         | Quote tool — live estimate + saves request          |
| `/quote/success` | Confirmation after submitting                       |

## How the quote works

The estimate is computed by `lib/quote.ts` and shown live as the visitor picks
options. The same logic runs **again on the server** (in `app/quote/actions.ts`)
so the stored price is authoritative and can't be tampered with from the client.

- Customer picks exactly one service: Interior Service $50, Exterior Service $50, or Full Detail $80 (launch pricing, reg. $100)
- Size upcharge: Sedan +$0, SUV / Truck / XL +$25
- Displayed as a ±15% range; final price confirmed after inspection

On submit, a Server Action inserts the full request into the Supabase
`quote_requests` table using the anon key (allowed by an INSERT-only RLS policy),
sends the business an **email + SMS notification**, then redirects to
`/quote/success`.

## Notifications

Every saved quote triggers a notification to the business (`lib/notifications.ts`),
called from the Server Action after the insert succeeds:

- **Email** via [Resend](https://resend.com) — a formatted summary with the
  customer's contact info, vehicle, service, service address, notes, and
  estimate. `replyTo` is set to the customer so you can reply directly.
- **SMS** via [Twilio](https://twilio.com) — a short text summary.

Both channels are **fail-safe**: each is isolated, a failure is logged but never
breaks a submission that already saved, and if a channel's env vars aren't set it
is simply skipped (with a warning in the logs). So the site works fine before you
configure them — add keys whenever you're ready.

### Testing notifications

Run the standalone smoke test (no form submission needed):

```bash
npm run test:notify
```

It builds a realistic fake quote, calls `sendQuoteNotifications()` directly, and
prints one line per channel:

- `SENT` — provider accepted it (shows the returned id: Resend email / Twilio SID)
- `SKIPPED` — that channel's env vars aren't set (it names which) — not an error
- `FAILED` — a configured channel errored (shows the message)

It exits `0` unless a **configured** channel actually errors (then `1`), so an
all-skipped run still passes. It reads keys from `.env.local` automatically.

See [`MANUAL_TESTING.md`](./MANUAL_TESTING.md) for the full checklist, including
the failure-isolation test (blank a key, submit a real quote, confirm it still
saves and redirects).

---

## Local setup

### 1. Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a
   new (free-tier) project.
2. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Create the table + RLS policy

In the Supabase dashboard: **SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](./supabase/schema.sql), and click **Run**. This:

- creates the `quote_requests` table,
- enables Row Level Security,
- adds a policy allowing **anonymous INSERT only** (no public reads — the leads
  are the business's private data, visible via the dashboard).

### 3. Add environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

To enable notifications, also set (all optional — skip a block to skip that
channel):

```
# Email (Resend)
RESEND_API_KEY=re_...
QUOTE_NOTIFICATION_TO=owner@example.com
QUOTE_NOTIFICATION_FROM=Zero Maintenance <quotes@yourdomain.com>

# SMS (Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+15551234567
QUOTE_NOTIFICATION_SMS_TO=+15559876543
```

> Resend note: the sandbox sender `onboarding@resend.dev` only delivers to your
> own Resend account email. For real delivery, verify a domain and set
> `QUOTE_NOTIFICATION_FROM` to an address on it. Phone numbers use E.164 format
> (`+1...`).

### 4. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Submit a quote at `/quote`
and confirm the row appears in **Table Editor → quote_requests**.

---

## Deploying to Vercel

1. Push this repo to GitHub and import it at
   [vercel.com/new](https://vercel.com/new) (framework auto-detected as Next.js).
2. Add your environment variables in **Project → Settings → Environment
   Variables** (Production, Preview, Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - _(optional, for notifications)_ `RESEND_API_KEY`, `QUOTE_NOTIFICATION_TO`,
     `QUOTE_NOTIFICATION_FROM`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`,
     `TWILIO_FROM_NUMBER`, `QUOTE_NOTIFICATION_SMS_TO`
3. Deploy.

## Viewing quote requests

Because RLS only allows INSERT, requests aren't publicly readable. View them in
the Supabase dashboard under **Table Editor → quote_requests**, or query with
the `service_role` key from a trusted server context.

## Project structure

```
app/
  layout.tsx            Root layout, fonts, metadata
  page.tsx              Landing page
  globals.css           Design system (Tailwind v4 theme, palette, motion)
  quote/
    page.tsx            Quote page shell
    quote-form.tsx      Client form with live estimate
    actions.ts          Server Action: validate, price, insert, redirect
    success/page.tsx    Confirmation page
components/
  site-header.tsx
  site-footer.tsx
  brand-logo.tsx        Logo (public/logo.png) with blend + diamond fallback
lib/
  quote.ts              Shared pricing logic + labels
  notifications.ts      Email (Resend) + SMS (Twilio) on new quotes
  supabase/server.ts    Server-side Supabase client
scripts/
  test-notifications.ts Standalone notification smoke test (npm run test:notify)
supabase/
  schema.sql            Table + RLS setup
public/
  logo.png              Drop your logo here (see public/README.md)
MANUAL_TESTING.md       Manual QA checklist
```
