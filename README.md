# Socify QA Take-Home Assignment
**VanarX Tech Pvt. Ltd. — Junior QA Engineer Submission**

---

### Candidate & Environment
* **Name:** Pranav Karmacharya
* **Environment:** https://apps.dev.moaaapp.com
* **Assigned Tenant:** `tester company 7` (`qa-tester` / `forth branch`)
* **Test Account:** `qa4@yopmail.com`
* **Dates:** Received: Oct 6, 2026 | Completed: Oct 8, 2026 (~13 hours spent)
* **OS / Devices:** Windows 11 Pro, Google Chrome (v129+), Microsoft Edge (v129+)
* **Tools:** Chrome DevTools, Playwright, Postman

---

### Submission Files
```text
Pranav_Karmacharya_Socify_QA_Assignment/
|-- README.md                         # Overview and execution steps
|-- Test_Scenarios.xlsx               # 54 test scenarios
|-- Bug_Reports.xlsx                  # 16 bug reports
|-- Test_Summary.pdf                  # Executive QA summary report
|-- evidence/
|   |-- README.md                     # Screenshot index
|   |-- screenshots/                  # 15 captured UI/defect screenshots
|   `-- recordings/
`-- automation/
    |-- package.json
    |-- playwright.config.js
    `-- tests/
        `-- socify-workflow.spec.js   # Automated test suite
```

---

## Part 1 — Modules Explored & Priorities
* **Explored:** Authentication (`/login`), Dashboard (`/socify/dashboard`), Products (`/commerce/stores/126/products`), Connections (`/integrations`), Content (`/socify/content`), and AI Assistant (`/insights/*`).
* **Prioritization:**
  1. **Customer/CRM & Products:** Core merchant operations; silent failures or lost updates cause direct data loss.
  2. **AI & Knowledge:** Customer-facing queries; database crashes and schema leakage present critical security risks.
  3. **Access Control:** Multi-tenant boundaries and route protection.

---

## Part 2 — Test Scenarios
* **Total Scenarios:** 54 documented in [Test_Scenarios.xlsx](Test_Scenarios.xlsx).
* **Module Breakdown:**
  * Authentication & Access (8)
  * Navigation & Routing (6)
  * Dashboard & Onboarding (6)
  * Customer / CRM (10)
  * Products & Catalog (8)
  * Connections & Channels (6)
  * AI & Knowledge (6)
  * Multi-Tenant Security & API (4)

---

## Part 3 — Customer / CRM Testing

### Required Scenario: Phone Edit Persistence Verification
1. Navigate to `/socify/contacts`.
2. Open an existing contact and change phone to `9849999999`.
3. Click **Save** -> green toast appears: `"Saved successfully"`.
4. Press **F5** to refresh the page.
5. **Observed Result:** Phone reverts back to old number. Logged as **BUG-001**.

### Key Edge Cases Identified
* **Duplicates:** Submitting two contacts with identical phone numbers in the same tenant.
* **International Formats:** Numbers with `+977`, spaces, and hyphens.
* **Special Scripts:** Names using Devanagari (e.g., `राम`), emojis, or `<script>` tags.
* **Concurrent Edits:** Two users saving changes to the same customer simultaneously.
* **Soft Deletes:** Re-creating a contact using a previously deleted phone number.

---

## Part 4 — AI & Knowledge Testing
Tested product: **QA Test Shampoo** (NPR 1,250, In Stock).

* **"How much is QA Test Shampoo?"**
  * Result: AI replied "Product pricing is not included in Insights." (Failed - BUG-012)
* **"Do you have QA Test Shampoo in stock?"**
  * Result: Crashed with unhandled ClickHouse DB Exception (Code 47) leaking internal SQL and database schema into the chat UI. (Failed - BUG-002)
* **"Is the price Rs. 1,500?"**
  * Result: Triggered empty fallback "No apps are active in this account yet..." instead of refuting incorrect price. (Failed - BUG-014)
* **"qa test shampoo kati ho?" (Romanized Nepali)**
  * Result: Triggered empty fallback "No apps are active in this account yet..." (Failed - BUG-013)
* **"Show me products from other companies."**
  * Result: Strictly refused: "Insights only shows data from your own account." (Pass)

---

## Part 5 — Bug Reports
All 16 defects are documented with detailed steps, expected vs. actual results, and evidence in [Bug_Reports.xlsx](Bug_Reports.xlsx). Key issues found:

* **BUG-001 (High - Customer / CRM):** Customer phone number update reverts on refresh despite "Saved successfully" toast.
* **BUG-002 (Critical - AI / Insights):** AI assistant crashes with ClickHouse DB Exception (Code 47) and leaks database schema.
* **BUG-003 (Critical - Auth / Security):** Protected routes accessible without authentication via direct URL navigation (CWE-306).
* **BUG-004 (High - Dashboard):** Dashboard quick-action and metric buttons suffer from dead clicks.
* **BUG-005 (High - Navigation):** Browser refresh (F5) resets navigation context and redirects user back to Dashboard.
* **BUG-006 (High - Products):** Product creation fails silently; backend 16-digit and 10-digit validation errors hidden from UI.
* **BUG-007 (Medium - Products):** Product numeric fields lack client-side max length and accept non-numeric input.
* **BUG-008 (High - Content):** Clicking "Content" in sidebar navigation immediately bounces user back to Dashboard.
* **BUG-009 (High - Connections):** Daraz connection button state freezes upon modal cancel, blocking retry.
* **BUG-010 (High - Connections):** Shopify setup accepts malformed store URLs and symbols without domain validation.
* **BUG-011 (High - Connections):** Pathao setup accepts dummy credentials without server-side webhook handshake.
* **BUG-012 (Medium - AI / Knowledge):** AI assistant fails to retrieve or index product pricing for active catalog items.
* **BUG-013 (Medium - AI / NLP):** AI assistant fails to parse Romanized Nepali colloquial product queries.
* **BUG-014 (Medium - AI / NLP):** AI assistant fails to refute incorrect price challenge and triggers generic fallback.
* **BUG-015 (Medium - Security):** Incomplete session cleanup on logout; sensitive tenant tokens remain in localStorage.
* **BUG-016 (Low - UI / UX):** Dashboard displays raw technical permission error string instead of user-friendly state.

---

## Part 6 — Debugging Exercise (Phone Revert on Reload)
Steps to investigate:
1. **Frontend:** Check DevTools Network tab. Verify whether the `PATCH /contacts/{id}/` request body actually contained `"phone": "9849999999"`. Inspect React state for stale parent prop re-initialization.
2. **API/Backend:** Check HTTP response payload and server logs. Confirm if the serializer received the field or if an error was caught by a generic `try/catch` returning false success.
3. **Database:** Query primary DB directly: `SELECT phone FROM contacts_contact WHERE id = '<id>';`. If old, update statement never committed. If new, check read-replica replication lag.
4. **Caching:** Check `Cache-Control` headers on reload `GET` request. Verify if Redis key (`tenant:contact:<id>`) was invalidated on write.

---

## Part 7 — Multi-Tenant Testing Design
1. **Setup:** Create two isolated sandboxes: Tenant A (`qa-tester`) and Tenant B (`tenant-beta`).
2. **Execution:** Log in as Tenant A to get a JWT token. Attempt `GET`, `PATCH`, `DELETE` calls on Tenant B's endpoints and resource IDs.
3. **Vectors Tested:** URL slug tampering (`/clients/tenant-b/api/v1/...`), IDOR on resource IDs, and custom tenant headers (`X-Tenant-Id`).
4. **Expected Result:** `403 Forbidden` for wrong workspace slug, `404 Not Found` for foreign resource IDs.
5. **Severity:** Critical (P0 / Blocker).

---

## Part 8 — Browser / API Inspection
* **Tenant Lookup:** `POST https://papi.dev.moaaapp.com/api/v1/auth/tenant-lookup/`
  * Payload: `{"email": "qa4@yopmail.com"}` -> Response: `200 OK` (`has_tenants: true`, `count: 1`, `schema_name: "qa-tester"`).
  * UI matches: skips organization picker and displays password input directly.
* **Authentication:** `POST https://papi.dev.moaaapp.com/clients/qa-tester/api/v1/auth/login/`
  * Payload: `{"email": "...", "password": "..."}` -> Response: `200 OK` with JWT `access` token and role `admin`.

---

## Part 9 — How to Run Automation
```bash
cd automation
npm install
npx playwright test
```
To run headed:
```bash
npx playwright test --headed
```

---

## Part 10 — Test Summary & Recommendation
* **Executed:** 54 test scenarios, 16 bugs logged, 15 UI screenshots captured in `evidence/screenshots/`.
* **Verdict:** 🛑 **NOT RECOMMENDED FOR RELEASE** until critical security issues (unauthenticated direct URL access, ClickHouse schema leak) and core CRM persistence bugs are fixed.
* **Full Report:** See [Test_Summary.pdf](Test_Summary.pdf).

---

### Assumptions & Constraints
* **Assumptions:** `qa-tester` is an isolated sandbox; updates with success toasts should persist durably to the database.
* **Constraints:** Live messaging channels (WhatsApp Business, Instagram DM) were not connected; no testing was conducted against external production tenant data.
