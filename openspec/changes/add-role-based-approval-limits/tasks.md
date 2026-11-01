# Tasks

## 1. Domain Approval Policy

- [x] 1.1 Implement role-aware single-approval limits in `ApprovalService`; verify via `ApprovalServiceTests` that a 50,000 Manager approval and 500,000 Director approval complete, while 50,000.01 Manager and any single approval above 500,000 are rejected without invoice mutation.
- [ ] 1.2 Implement the high-value two-approval transition and validate eligibility before mutation; verify tests that Approver/Admin first approval leaves the invoice pending, a different Director completes it, and same-user or wrong-role attempts return clear errors without changing invoice fields.
- [x] 1.3 Preserve existing lifecycle behavior and test coverage; verify the existing submit, normal approval, and rejection tests still pass alongside new tests for Approver/Admin single approval through 500,000 and ineligible roles/amounts.

## 2. API Role Wiring and Authorization

- [x] 2.1 Pass the authenticated username and role from the session into the approval service and permit Manager/Director on the approval endpoint only; verify unauthorized approval roles receive HTTP 403 and rejection remains limited to Approver/Admin.
- [x] 2.2 Add API authorization tests using configured or test users for Manager, Director, Approver, Admin, and an unauthorized role; verify role gating is independent of amount-policy errors returned by the service.

## 3. Layering and Integration Verification

- [x] 3.1 Add an architecture test in the existing test setup that verifies the Domain project does not depend on the API/web layer and approval policy remains outside controllers and `Program.cs`; verify the architecture test passes without adding an unnecessary test framework.
- [x] 3.2 Run the full solution test suite and build after the domain and API changes; verify `dotnet test backend/InvoiceApp.sln` and `dotnet build` succeed.
