# Design

## Context

`ApprovalService.Approve` currently receives only an invoice ID and approver username, then immediately sets `Invoice.Status`, `DecidedBy`, and `DecidedAt`. The API obtains a username and role from the signed-in session, while `ApprovalsController` currently permits only `Approver` and `Admin`. There are no existing capability specs or API/architecture test suites; the current xUnit tests reference the Domain project.

See [proposal.md](./proposal.md) for motivation and [specs/invoice-approval/spec.md](./specs/invoice-approval/spec.md) for externally observable requirements.

## Goals / Non-Goals

**Goals:**

- Keep role and amount decisions in the Domain service, with role and actor identity supplied by the API.
- Represent an incomplete high-value approval without falsely marking the invoice decided.
- Retain the existing `DecidedBy` and `DecidedAt` fields as the final decision record.
- Ensure validation precedes mutation so rejected attempts preserve invoice state and audit data.

**Non-Goals:**

- Change sign-in, token, invoice submission, or invoice rejection flows.
- Add a persistence provider, database migration, or new credentials for demo users.
- Change single-approval behavior for existing Approver and Admin roles through 500,000.

## Decisions

1. **Evaluate approval policy in `ApprovalService`.** Extend the service operation to receive the current session role along with the username. The API continues to enforce sign-in and permits all four approval roles to reach the service; the service enforces role-and-amount eligibility. This keeps business rules out of controllers and avoids relying on endpoint authorization alone for amount limits. Continue using the existing service error handling so rejected rules produce a clear conflict response.

   Alternatives considered: putting thresholds in controller attributes or controller branches would split business rules across layers and would not protect non-HTTP service callers; adding a separate policy service is unnecessary for this single policy in the current application.

2. **Store the first high-value approval separately.** Add first-approval identity and timestamp data to the invoice model. For an invoice above 500,000, an Approver or Admin's first approval records that data but leaves the invoice pending. A later, distinct Director approval sets the final decision fields and approved status. Continue using `DecidedBy` and `DecidedAt` only for the final decision, preserving their existing meaning for current consumers.

   Alternatives considered: marking the invoice approved after the first action would misrepresent its state; reusing `DecidedBy` for an incomplete approval would change the meaning of existing decision data and make the final approver ambiguous.

3. **Use the signed-in username as the distinct-approver identity.** Compare the username supplied by the session with the recorded first approver before any mutation. The configured demo-user model has one role per username, and no separate stable identity key exists.

   Alternatives considered: comparing display names or role values would not establish distinct identities; adding a new identity system is outside this change.

4. **Keep the role set backward-compatible.** Extend the approval endpoint's role allow-list with Manager and Director while retaining Approver and Admin. Continue using the existing configured-user role field; do not add demo passwords or alter existing role assignments as part of this feature.

5. **Test the behavior at the layer that owns it.** Expand Domain service tests for amount boundaries, role eligibility, high-value sequencing, duplicate actors, rejection reasons, and unchanged invoice data. Add API authorization coverage for all allowed roles and an unauthorized role, plus an architecture test that protects the Domain/API dependency boundary. No architecture-test framework is currently present, so prefer a small test using the existing test project and project/assembly references over adding a dependency.

## Risks / Trade-offs

- [A role may be allowed by the endpoint but not eligible for a given amount] → Keep the endpoint role allow-list limited to Manager, Director, Approver, and Admin, and make service errors explicit for amount or sequence violations.
- [Adding approval fields can expose partial approval data to existing API consumers] → Keep existing final decision fields unchanged and expose first-approval data only as needed to describe the pending high-value state.
- [There is no API or architecture test infrastructure today] → Extend the existing test setup only as needed and verify the Domain project remains independent from the API; avoid introducing a broad testing framework.

## Migration Plan

No data migration is required because invoices are stored in memory. Add the new fields and role handling, retain the configured Approver/Admin users, and allow deployments to assign Manager or Director through the existing user configuration. Rollback is a code rollback; in-memory invoice state is discarded when the process restarts.

## Open Questions

None. Role compatibility and the required first approver for high-value invoices were clarified before drafting.
