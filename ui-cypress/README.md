# UI Test Suite (Cypress) - GuinnessWR

E2E/UI regression suite for the GuinnessWR frontend, built for the Software Quality
Ordinary Project (period 202660).

## Design

- **Page Object Model**: `cypress/pages/RecordsPage.js` and `cypress/pages/AuthPage.js`
  wrap every selector used by the specs. Specs never query the DOM directly -
  they call page object methods.
- **Selectors**: every element the tests touch has a stable `data-cy="..."`
  attribute added to the frontend components (`AuthForm`, `RecordForm`,
  `EditModal`, `RecordGallery`/`RecordCard`, `Navbar`, `Hero`, `App`). These
  never depend on CSS classes or text content that could change.
- **Fixtures + `cy.intercept()`**: every backend call (`/api/records`,
  `/api/auth/login`, `/api/auth/register`, `/api/health`) is intercepted and
  answered from a JSON fixture in `cypress/fixtures/`. The suite never depends
  on the live Render/Mongo backend being awake or reachable, so it is fast and
  deterministic. `cypress/support/commands.js` has one `cy.stubXxx()` helper
  per backend call plus a `cy.visitApp()` helper that wires up the default
  (happy-path) stubs before visiting `/`.
- **Custom commands**: `cy.visitApp()`, `cy.stubHealthOk/Down()`,
  `cy.stubRecordsList()`, `cy.stubCreateRecord()`, `cy.stubUpdateRecord()`,
  `cy.stubDeleteRecord[Forbidden]()`, `cy.stubLoginSuccess/Invalid()`,
  `cy.stubRegisterSuccess/Duplicate()`.

## Test cases

| Suite | Count | Files |
|---|---|---|
| Smoke | 4 | `cypress/e2e/smoke/smoke.cy.js` |
| Regression | 12 | `cypress/e2e/regression/gallery-states.cy.js` (4), `auth.cy.js` (5), `records-crud.cy.js` (3) |

See `Test_Plans.xlsx` (sheet `UI_Tests`) for the full 9-column test-case table
(ID, Title, Level/Suite, Case type, Technique, Preconditions & test data,
Steps, Expected result, Priority & Status).

## Running it

The suite runs against a local static build of the frontend (so it never
needs network access to the real backend):

```bash
cd frontendguinnesswr
npm install
npm run build
npx vite preview --port 4173 --strictPort &

cd ../ui-cypress
npm install
npx cypress run                 # headless, records video + screenshots on failure
# or: npx cypress open          # interactive runner
```

`cypress.config.js` points `baseUrl` at `http://localhost:4173`.

## Known limitation in this environment

Cypress's own binary is downloaded from `download.cypress.io` /
`cdn.cypress.io` the first time `cypress` runs. Those hosts are not reachable
from the Claude sandbox that built this suite (outbound network there is
allow-listed, and those two hosts are not on the list - confirmed with a
direct `curl -v`, which got back a `403` from the sandbox's own egress proxy,
not from Cypress or Render). Every file above was written and syntax-checked
in that sandbox, and the `data-cy` selectors were verified against the actual
production build output (`dist/assets/*.js`), but the suite could not be
executed there. Run `npx cypress run` on a machine with normal internet
access (e.g. Marcos's own laptop, which already has Cypress installed for
another class project) to get the real pass/fail results, video and
screenshots for Section H of the report.
