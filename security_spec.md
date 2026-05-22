# Security Specification - Aura Tap

## Data Invariants
1. **Users**: A user document must match the authenticated UID. Only the admin or the owner can read profile data.
2. **Leads**: Any visitor can submit a lead. Only admins can read or update lead status.
3. **Affiliate Stats**: Created by the system/admin upon approval. Read-only for the affiliate, read/write for admin.
4. **Sales**: Recorded transactions. Immutable once created. Attributed to an affiliate.

## The "Dirty Dozen" Payloads
1. Attempt to create a user with `role: 'admin'` as a non-admin.
2. Attempt to read another user's profile.
3. Attempt to update `role` in own profile.
4. Attempt to read all leads as a non-admin.
5. Attempt to update a lead's status as a non-admin.
6. Attempt to inject a 1MB string into a lead's name.
7. Attempt to create a sale record as an affiliate (system only).
8. Attempt to read another affiliate's stats.
9. Attempt to update cumulative sales in affiliate stats.
10. Attempt to delete a sale record.
11. Attempt to create a user profile without a UID.
12. Attempt to spoof `email_verified` (rules should check `request.auth.token.email_verified`).

## Rules Implementation Strategy
- Use `isValidUser`, `isValidLead`, `isValidAffiliate`, `isValidSale` helpers.
- `isAdmin` check based on UID lookup in `admins` collection or explicit UID match for bootstrap.
- Strict `affectedKeys().hasOnly()` for updates.
