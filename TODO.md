# MathWithMDU Audit & Fix - TODO

## Completed
- [x] Verified logo/favicon asset paths: removed unencoded `assets/logo - *.png` references across all HTML pages.
- [x] Verified encoded paths exist: `assets/logo%20-%20*.png`.

## Next (to implement)
### SEO / metadata (HTML)
- [x] Add `<meta name="description">`, `robots`, `canonical` (where appropriate) and basic OpenGraph/Twitter tags for key pages.
- [x] Add `lang` correctness and ensure titles are unique and accurate.

### Security
- [x] Replace `prompt()` admin credential collection in `admin.js` with proper form-based submission and client-side validation.
- [x] Remove/limit `innerHTML` usage in `navbar.js` and admin/dashboard where feasible (use DOM APIs instead).
- [x] Add a safe CSP strategy compatible with current code (no inline scripts or refactor to external JS).
- [x] Ensure Paystack integration does not rely on missing `window.__ENV__` injection.

### Performance / rendering
- [x] Avoid repeated large `innerHTML` rebuilds; prefer document fragments / batching for dashboard lists.
- [x] Reduce unnecessary console logging in production.

### Routing / navigation stability
- [x] Standardize navbar markup IDs across pages to reduce fragile selector logic.
- [x] Ensure active-link highlighting works correctly for hash + full page routes.

### Accessibility / mobile usability
- [x] Add `aria-expanded` / `aria-controls` to the hamburger toggle and ensure focus management when opening/closing mobile menu.
- [x] Verify cookie banner buttons are keyboard-accessible and properly labeled.

## QA / Regression
- [ ] Manual smoke test: navigate Home/Plans/Contact/Login/Register/Dashboard/Admin.
- [ ] Auth flow test: login, logout, role-based admin gating.
- [ ] Payment flow: plan buttons (Paystack) load checks + double-click protection.
- [ ] Accessibility smoke test: keyboard navigation + screen reader labels.


