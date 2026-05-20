# Admin authorization hardening (Custom Claims)

## What changed
- Removed automatic granting of `admin: true` custom claims inside the Paystack webhook.
- Admin rights are now controlled **only** via custom claims set explicitly for a known admin UID.

## How to grant admin access for a specific UID
Run:

```bash
node server/setAdminClaim.js <ADMIN_UID>
```

Example (use your UID):

```bash
node server/setAdminClaim.js YkHpl978BoYiPQOrOKhPkdSY1pu2
```

After setting the claim, the user must sign out and sign back in (or force token refresh) for the claim to apply.

## Where authorization is enforced
- Client gate: `admin.js` checks `tokenResult.claims.admin === true`.
- Security Rules gate: `firestore.rules` `isAdmin()` checks `request.auth.token.admin == true`.

## Notes
- Paystack webhook continues to activate user plans/payments, but no longer escalates privileges.

