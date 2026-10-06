# PAC Research — Report Archive Backend

Firebase Cloud Functions (v2, Node 22, TypeScript) powering payments and secure
report access. This directory did not exist before the Report Archive feature —
it introduces the first server-side code in the project.

## What's here

**Payments**

| Function | Type | Purpose |
|---|---|---|
| `initializePaystackTransaction` | callable | Resolves price (report or seat add-on), applies loyalty discount, records a `transactions` doc, and starts a Paystack checkout with the 75/25 split. |
| `paystackWebhook` | HTTPS | Verifies the Paystack signature, re-verifies the transaction, and fulfills it (creates `purchases`, updates `customers`, bumps counters / org seats). Idempotent. |
| `verifyPaystackTransaction` | callable | Client poll after redirect back from Paystack, in case the webhook is delayed. Idempotent with the webhook. |
| `processRefund` | callable (admin) | Refunds via Paystack, marks the transaction refunded, **revokes** the purchase, writes an audit log, notifies the customer. |

**Organizations / seats**

| Function | Type | Purpose |
|---|---|---|
| `inviteOrgMember` | callable | Primary contact invites a colleague; enforced against the seat limit. |
| `acceptOrgInvite` | callable | Links the invitee to the org (transactional, seat-checked). |
| `getOrgRoster` | callable | Members + pending invites + seat usage for the account page. |

**Secure viewing**

| Function | Type | Purpose |
|---|---|---|
| `issueSecureViewStream` | HTTPS | Verifies a live ID token **and** an active purchase on every request, then streams the PDF bytes. No shareable URL is ever issued. |

**Admin + notifications**

| Function | Type | Purpose |
|---|---|---|
| `setCustomerStatus` | callable (admin) | Suspend/reactivate a customer (also disables the Auth user, cutting off viewing). |
| `setPurchaseStatus` | callable (admin) | Revoke/restore access for a licensing violation, without refunding. |
| `updateLoyaltyConfig` | callable (admin) | Sets the loyalty discount percentage (default 30%) and on/off. |
| `sendCustomerPasswordReset` | callable (admin) | Generates a password-reset link for a customer. |
| `onEditionPublished` | Firestore trigger | **Major update** → notifies owners of the predecessor edition that a new edition is out and they're eligible for the loyalty discount. |
| `onEditionMinorUpdate` | Firestore trigger | **Minor update** → notifies owners that the edition they already own was refreshed for free. |

Shared logic lives in `src/lib/` (`money.ts` fee/split math, `paystack.ts`
HTTP client + signature check, `admin.ts` role gate, `notify.ts` in-app +
email notifications, `firebase.ts` Admin SDK).

### Email

`notify.ts` always writes an in-app notification, and additionally sends email
**only when `EMAIL_API_KEY` is set** (SendGrid is the implemented provider —
set `EMAIL_PROVIDER` / `EMAIL_FROM` to change sender details). With no key
configured, email is skipped and logged; nothing else breaks. Pick a provider
and set the secret when the client is ready.

## One-time setup

1. **Upgrade the Firebase project to the Blaze plan** (required for Functions).
2. Install the Firebase CLI: `npm i -g firebase-tools` (not yet installed here).
3. `cd functions && npm install`
4. Set the Paystack secret (test key first):
   ```
   firebase functions:secrets:set PAYSTACK_SECRET_KEY
   ```
5. Configure non-secret params in `functions/.env` (copy from `.env.example`).
   Create a Transaction Split in the Paystack dashboard (PAC Research 75% /
   Ziltch1 25%) and put its code in `PAYSTACK_SPLIT_CODE`.
6. Deploy rules + functions:
   ```
   firebase deploy --only firestore:rules,storage:rules,functions
   ```
7. Point a Paystack webhook at the deployed `paystackWebhook` URL.
8. Seed the first admin + config singletons (see `scripts/seed.js` header):
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./sa.json \
   FIRST_ADMIN_UID=<uid> FIRST_ADMIN_EMAIL=<email> SEAT_ADDON_PRICE=<naira> \
   node scripts/seed.js
   ```

> Seat add-on price is not in the technical spec — set `SEAT_ADDON_PRICE` to the
> client's chosen value before corporate seat purchases go live.

## Local testing (emulator)

```
npm run build
firebase emulators:start --only functions,firestore,auth,storage
```

Use test-mode Paystack keys. The fee/split math can be checked directly:

```
node -e "console.log(require('./lib/lib/money').computeSplit(100000))"
# → paystackFee 1500, netAmount 98500, splitPacResearch 73875, splitZiltch1 24625
```

## Notes / follow-ups

- `firestore.rules` and `storage.rules` did not exist before; reconcile with any
  rules currently live in the Firebase console before deploying.
- Notification emails are stubbed to an in-app notification doc for now; the
  transactional email provider is wired in Phase 6.
