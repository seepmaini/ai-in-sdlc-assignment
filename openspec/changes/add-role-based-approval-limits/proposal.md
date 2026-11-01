# Proposal

## Why

Invoice approval currently allows one approver to decide any pending invoice, regardless of amount or role. Amount-based approval limits and a distinct director review for high-value invoices will make approval decisions safer while preserving the existing roles' behavior within the single-approval range.

## What Changes

- Add Manager and Director approval roles with single-approver limits of 50,000 and 500,000 respectively; the limits are inclusive.
- Preserve existing Approver and Admin roles, allowing them to approve a single invoice through 500,000.
- Require invoices above 500,000 to receive two approvals: an existing Approver or Admin may act first, and a distinct Director must provide the second approval.
- Prevent one username from satisfying both approvals. Attempts that fail role, amount, or distinct-approver rules must return a clear reason and leave invoice state and decision data unchanged.
- Preserve existing submission, rejection, and approval behavior outside these amount and role rules.

## Capabilities

### New Capabilities

- `invoice-approval`: Role- and amount-aware approval rules, including multi-approver decisions for high-value invoices.

### Modified Capabilities

None. No existing capability specs are present.

## Impact

- `InvoiceApp.Domain.ApprovalService` and `Invoice` will own approval-policy decisions and any data needed to represent the first approval.
- `InvoiceApp.Api` approval handling and role authorization/configuration will need to make Manager and Director roles available while retaining Approver and Admin.
- `InvoiceApp.Tests` will cover amount boundaries, eligible and ineligible roles, distinct approvers, unchanged invoice data on rejected attempts, and existing behavior.
- Architecture tests should verify that approval policy remains in the Domain layer and is not moved into controllers or `Program.cs`.
