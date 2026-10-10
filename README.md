# London Property Services (LPS) — Production Source Pack

This pack upgrades the original demo into a production-oriented architecture:

- React Native CLI mobile client
- Node.js + Fastify API
- PostgreSQL database + migrations
- Argon2 password hashing
- JWT access tokens + rotating refresh tokens
- Role-based LPS staff/admin endpoints
- Stripe PaymentIntent flow for repair invoices
- Stripe Checkout subscription flow for monthly plans
- Stripe webhook verification
- Ticket lifecycle and audit events
- Docker PostgreSQL
- CI workflow
- HTTPS reverse proxy example

## Important

A truly deployable App Store / Google Play release still needs real production credentials: Apple/Google developer accounts, signing certificates, bundle/application IDs, production API domain, database, Stripe live keys and price IDs, legal documents, and (if desired) push-notification credentials. Those must not be invented or committed into source code.

React Native 0.87.1 is pinned because React Native 0.87 is the current stable series at the time of this pack. React Native's official release page says 0.87 is active and 0.88 is a release candidate. Stripe React Native is pinned to 0.77.0. React Navigation is compatible with the current 7.x line.

## Start API

```bash
cd api
cp .env.example .env
# Put real production values in .env or, preferably, a secret manager.
npm ci
npm run migrate
npm run seed
npm run build
npm start
```

## Database

For local development:

```bash
cd infra
docker compose up -d
```

Then run the API migration.

## Mobile

The native `android/` and `ios/` directories should be generated using the pinned React Native CLI template for 0.87.1, then copy the `mobile/` source over that shell. This avoids checking in machine-specific signing files and makes the release configuration explicit.

```bash
npx @react-native-community/cli@latest init LPSMobile --version 0.87.1
```

Set the API URL and Stripe publishable key in `mobile/src/config.ts`  [api\dist], then:

```bash
cd LPSMobile
npm install
cd ios && pod install && cd ..
npm run android
# or npm run ios
```

## Stripe setup

Create four recurring Stripe Prices for Basic, Silver, Gold and VIP. Put their `price_...` IDs in the API environment. Never put the Stripe secret key in the mobile app.

The repair invoice flow uses a server-created PaymentIntent and Stripe PaymentSheet. Monthly packages use a server-created Stripe Checkout subscription session.

## Ticket lifecycle

`OPEN → AWAITING_PAYMENT → PAID → IN_PROGRESS → COMPLETED → CLOSED`

The LPS team sends a quote. The customer pays online. LPS marks the physical job completed. The homeowner confirms the work and submits a 1–5 star rating, after which the ticket closes.

## Business-rule clarification

The supplied Gold plan says both “Unlimited call” and “Over 4 times pay for materials only”. The source uses **unlimited calls** as the primary Gold call rule. Confirm the final commercial wording before enabling live subscriptions.

## Security before launch

- Replace all example secrets.
- Use a managed secret store.
- Use HTTPS only.
- Configure Stripe live webhook signing secret.
- Restrict CORS to the real app/web origins where applicable.
- Enable database backups and restore tests.
- Create real LPS staff accounts; remove the seed admin before production.
- Add MFA for staff/admin accounts.
- Add monitoring and error tracking.
- Add privacy policy, terms, cancellation/refund rules and support details.
- Test Apple/Google release builds on physical devices.
