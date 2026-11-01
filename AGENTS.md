# Project conventions for AI agents

Invoice approval demo app: ASP.NET Core 8 Web API with a small static web UI.

## Layout

- `backend/src/InvoiceApp.Domain`: business rules, no web or storage code. `ApprovalService` owns the invoice lifecycle (Draft, PendingApproval, Approved, Rejected).
- `backend/src/InvoiceApp.Api`: controllers, sign-in (`Auth/`), in-memory repository, and the web UI under `wwwroot/`.
- `backend/tests/InvoiceApp.Tests`: xUnit tests, one test class per class under test, named `<ClassUnderTest>Tests`.
- `e2e`: Playwright end-to-end tests (`tests/`) and page objects (`pages/`).
- `docs/use-cases`: short briefs for features we may build.

## Conventions

- Controllers live in `Controllers/`, one per resource, route `api/[controller]`. Request bodies are `record` types declared inside the controller.
- Controllers inherit `ApiControllerBase` and use `Handle(...)` so service errors map to 404, 409 and 400.
- Every endpoint is behind sign-in. Restrict actions with `[RequireRole("...")]`: destructive actions are Admin only; approval and rejection actions allow Approver, Admin, Manager, and Director. Approval amount and sequence eligibility are enforced by `ApprovalService`.
- Business rules go in the Domain project, never in controllers.
- Register services in `Program.cs`. Repositories are interfaces in Domain with an in-memory implementation in Api.
- Every new rule or endpoint needs tests. Use `FakeInvoiceRepository` in tests.
- Use clear names; no one-letter variables or `flag` parameters.
- End-to-end tests use page objects and role-based locators (`getByRole`, `getByLabel`), never CSS or XPath selectors.

## Commands

- Run the app: `dotnet run --project backend/src/InvoiceApp.Api` then open http://localhost:5000
- Run the tests: `dotnet test backend/InvoiceApp.sln`
- Run end-to-end tests: `cd e2e && npm install && npx playwright install chromium && npm test`

## Demo accounts (not real credentials)

- `demo.approver` / `ChangeMe123!` (role Approver)
- `demo.admin` / `ChangeMe123!` (role Admin)
- `demo.manager` / `ChangeMe123!` (role Manager)
- `demo.director` / `ChangeMe123!` (role Director)

## Never

- Commit real credentials, tokens or customer data.
- Add business logic to `Program.cs` or controllers.

## Approval Rules

- A Manager may approve invoices up to 50,000; a Director may approve invoices up to 500,000.
- Approver and Admin retain single-approval authority through 500,000.
- Invoices above 500,000 require an Approver or Admin first, followed by a distinct Director.
- The same user may never count as both approvers on one invoice.
- A rejected attempt returns a clear reason and does not change invoice data.

## The Layering Rules

- Follow the existing .NET architecture and layer boundaries.
- Keep business logic in the appropriate service/application layer.
- Add or update architecture tests to verify layer boundaries.

## Test Commands

- Build: dotnet build
- Run all tests: dotnet test
- Run tests after every relevant code change.
- Fix failing tests before completing the task.

## Review Expectations

- List every finding with one of these verdicts:
  - Fixed
  - Dismissed with a reason
  - Deffered with a reason
- Include each finding's severity, file/location, explanation, and recommended fix.
- Verify fixes against the updated diff and relevant tests.
- Do not mark a finding as fixed without evidence.
- Do not mark a finding as removed without a clear reason.
- Summarize unresolved findings before declaring the review complete.
