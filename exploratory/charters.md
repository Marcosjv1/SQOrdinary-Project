# Exploratory Testing - GuinnessWR

Session-based testing against the live deployed app
(`https://guinnesswr.netlify.app`, backend `https://backendguinnesswr.onrender.com`).
All three charters below were run live. Charter 1 happened during a session
where the Render free-tier backend was stuck waking up for an extended
period - which turned into the test condition for that charter rather than a
blocker for it. Charters 2 and 3 were run after the backend was confirmed
healthy.

---

## Charter 1

**Mission:** Explore the gallery, auth and health-check areas of the app
**with a slow/unresponsive backend**, using the **Constraints** and
**Follow the Data** heuristics, to see what feedback (if any) the user gets.

**Time box:** 30 minutes
**Tester:** Claude (computer-use session), live app + console/network inspection

### Test notes

- Navigated to `https://guinnesswr.netlify.app` while
  `backendguinnesswr.onrender.com` was in Render's "waking up" state (a known,
  real condition on the free tier after the service has been idle - it can
  legitimately take several minutes, and on this occasion took well over 15
  minutes without finishing).
- The gallery section shows a spinner and "Cargando récords..." the instant
  the page loads. **It never changes.** No timeout, no retry, no "try again"
  button - confirmed by leaving the tab open and re-checking repeatedly over
  more than 10 minutes.
- The browser console logged `Failed to load resource: the server responded
  with a status of 503 ()` - so at least one request to the backend *did*
  get a response.
- Despite that 503, the "Backend no disponible" badge in the hero section
  (`Hero.jsx`, driven by `checkHealth()` in `api.js`) never appeared. Checked
  with `find("Backend no disponible")` -> no matches, and confirmed visually
  with a screenshot.

### Bugs / issues found

1. **No request timeout or user feedback on a slow/unreachable backend.**
   `services/api.js`'s `fetch()` calls have no `AbortController`/timeout, so a
   slow backend leaves the UI showing an indefinite loading spinner with zero
   indication to the visitor that anything is wrong, or how long to expect.
   This matters in practice: this exact condition (Render cold start) happened
   live during this testing session.
2. **The offline badge does not reliably reflect backend health.** A 503 was
   observed in the console, but `backendOk` never flipped to `false` and the
   badge never rendered. Needs code-level follow-up: either `checkHealth()`
   isn't resolving/rejecting the way `App.jsx` expects when Render returns its
   interstitial "waking up" HTML page (which is a 503, but may not be valid
   JSON - `checkHealth()` calls `res.json()` only after checking `res.ok`, so
   this specific shape of failure should still reject correctly in theory;
   worth a closer look at whether the holding-page response ever completes a
   fetch cycle at all versus hanging the connection open).

### Questions raised

- Is there a product requirement for a maximum wait time before showing an
  error state, or a manual "retry" action for the visitor?
- Should `checkHealth()` have its own short timeout independent of the main
  records fetch, so the badge can appear even while the gallery is still
  "loading"?

---

## Charter 2

**Mission:** Explore site-wide navigation and the record/account forms using
the **CRUD**, **Selection** and **Follow the Data** heuristics, cross-checking
what the UI exposes against what the API actually allows (per the API test
suite in `api-postman/`).

**Time box:** 30 minutes
**Tester:** Claude (computer-use session + source review)

### Test notes

- Walked the accessibility tree of the page (navbar, hero, gallery, new-record
  form, auth form, footer) to inventory every link and interactive control.
- Compared the **navbar**'s three links (`Récords` -> `#records`, `Nuevo
  Récord` -> `#nuevo`, `Cuenta` -> `#auth`) against the **footer**'s three
  links, which repeat the same three labels.
- Tried the boundary values for the login form's username/password
  (`minLength={3}`/`minLength={6}` in `AuthForm.jsx`) by typing a 2-character
  username and a 3-character password and submitting.
- Cross-referenced the record form: the public "Registrar nuevo récord" form
  has no field for `isOficial`, but the backend's `createRecord` controller
  accepts an `isOficial` flag directly from the request body with no
  server-side restriction on who can set it (same observation already used as
  a POISED-Security case in the API suite, `API-RG-14`/the "Setup: create an
  official record" request's description).

### Bugs / issues found

1. **Broken footer link.** `Footer.jsx`'s "Cuenta" link points to `#cuenta`,
   but the actual section id (set in `AuthForm.jsx`) is `id="auth"`. The
   navbar's own "Cuenta" link correctly uses `#auth`, so this is an
   inconsistency introduced only in the footer - clicking "Cuenta" in the
   footer does nothing, while the identical link in the navbar works.
   Confirmed by reading both component source files side by side.
2. **`isOficial` is client-settable with no authorization check** (same root
   cause as the missing `authMiddleware` on `recordRoutes.js` found while
   building the API suite). The public UI never exposes this, so a casual
   user wouldn't hit it by clicking around - but anyone who opens dev tools
   or a tool like Postman can mark their own record "official" (and official
   records are then protected from deletion), which is a business-rule gap
   worth flagging to the team even though it's really an API-layer finding
   surfaced here by thinking about what the UI *doesn't* show.

### Confirmed by the Cypress UI suite

- Submitting the login form with a 2-character username and a 3-character
  password - both under the HTML `minLength` set on those inputs - still
  appeared to trigger the submit handler (button changed to "Procesando...")
  during this scripted session, rather than being blocked by the browser's
  native constraint validation. This was flagged at the time as needing
  confirmation with a real (non-scripted) click, since it could have been an
  artifact of how the automated click was dispatched. It has since been
  **confirmed** with real, automated assertions in `auth.cy.js` (`UI-RG-07`,
  `UI-RG-08`): `checkValidity()` on both fields returns `true` for
  under-length input, meaning the `minLength` guard genuinely does not block
  short credentials client-side (the backend's own length checks in
  `authController.js` still reject them server-side either way, so this is a
  UX gap, not a security one).

### Questions raised

- Should the footer links be removed in favor of just the navbar, or fixed to
  match it?
- Is restricting `isOficial` to come from the server only (e.g. always
  `false` on create, with a separate admin-only endpoint to promote a record)
  in scope for this project, or is it accepted as a known limitation of the
  reused SUT?

---

## Charter 3

**Mission:** Explore the login/register flow and browser storage, using the
**Follow the Data** heuristic and the DevTools **Application** panel, to
discover how (and where) the app keeps a logged-in user's session.

**Time box:** 15 minutes
**Tester:** Claude (browser session against the live, now-healthy backend)

### Test notes

- Registered a throwaway test account (`charter3_test_user`) through the real
  "Crear cuenta" form against the live backend.
- Right after registration, inspected the page's storage directly
  (`localStorage`, `sessionStorage`, `document.cookie`):
  - `localStorage` contained two keys: `username` (plain text) and `token`.
  - `sessionStorage` and cookies were empty/unused for auth.
- Attempted to resize the browser viewport to a phone width (390x844) to also
  check responsive layout per the DevTools "Device toolbar" check. **This
  check is inconclusive**: `window.resizeTo` in this remote browser session
  did not actually change `window.innerWidth` (stayed at 1920 regardless of
  the resize call), so no real responsive-layout observation could be made
  this session - noted here rather than reported as a false finding either
  way. Worth a real phone/DevTools check by a human tester before the
  presentation.

### Bugs / issues found

1. **JWT stored in plain `localStorage`, not an httpOnly cookie.** Anyone who
   can run JavaScript on the page (e.g. via a future XSS bug, or a malicious
   browser extension) can read `localStorage.token` directly and steal the
   session - there is no `HttpOnly`/`Secure` cookie protecting it. This is a
   known trade-off of SPA+JWT architectures, but worth naming explicitly as a
   risk in the project document rather than leaving it undiscussed, since
   it's a real, verifiable property of this SUT and ties into the existing
   `authMiddleware`/`isOficial` authorization findings from Charter 2.

### Questions raised

- Is moving the token to an httpOnly cookie (with a CSRF-safe approach) in
  scope for this course, or is it accepted as a known architectural
  limitation of the reused SUT?
- Can a teammate re-run the responsive/device-toolbar check by hand (real
  Chrome DevTools, not a remote session) before the presentation, so Section
  G has a confirmed observation instead of an inconclusive one?

---

## Summary for Section H

| Charter | Area | Heuristics | Bugs found | Status |
|---|---|---|---|---|
| 1 | Gallery / health-check feedback | Constraints, Follow the Data | No timeout/feedback on a slow backend; offline badge doesn't activate on a 503 | Complete |
| 2 | Navigation / forms vs API | CRUD, Selection, Follow the Data | Broken footer "Cuenta" link; client-settable `isOficial` with no auth check (ties to API-RG-14); username/password `minLength` not enforced client-side (confirmed later by Cypress `UI-RG-07`/`UI-RG-08`) | Complete |
| 3 | Login/register session storage | Follow the Data, Application (DevTools) | JWT stored in plain `localStorage` (XSS-stealable) | Complete (responsive/device-toolbar check inconclusive - see notes) |
