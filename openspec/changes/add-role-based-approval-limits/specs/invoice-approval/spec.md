# Spec Delta

## Purpose

Defines which roles may approve invoices by amount and when a second, distinct approval is required. This capability keeps approval decisions accountable while preserving the existing Approver and Admin roles.

## ADDED Requirements

### Requirement: Single approvals respect role limits
The system SHALL allow a Manager to approve an invoice of 50,000 or less and a Director to approve an invoice of 500,000 or less. Existing Approver and Admin roles SHALL retain single-approval authority for invoices of 500,000 or less. No role SHALL approve an invoice above 500,000 with only one approval.

#### Scenario: Manager approves at the inclusive limit
- **WHEN** a Manager approves a pending invoice for 50,000
- **THEN** the invoice is approved and the Manager is recorded as the approver

#### Scenario: Manager is unauthorized above the limit
- **WHEN** a Manager attempts to approve a pending invoice for more than 50,000
- **THEN** the attempt is rejected with a clear reason and the invoice remains unchanged

#### Scenario: Director approves within the inclusive limit
- **WHEN** a Director approves a pending invoice for 500,000
- **THEN** the invoice is approved and the Director is recorded as the approver

#### Scenario: Director is unauthorized above the limit with one approval
- **WHEN** a Director attempts to approve a pending invoice for more than 500,000 without a prior approval from an existing Approver or Admin
- **THEN** the attempt is rejected with a clear reason and the invoice remains unchanged

#### Scenario: Existing roles retain single approval through the limit
- **WHEN** an Approver or Admin approves a pending invoice for 500,000 or less
- **THEN** the invoice is approved and the acting user is recorded as the approver

#### Scenario: Existing role cannot approve a high-value invoice alone
- **WHEN** an Approver or Admin attempts to approve a pending invoice for more than 500,000
- **THEN** the attempt is rejected with a clear reason and the invoice remains unchanged

### Requirement: High-value invoices require two distinct approvers
The system SHALL require an existing Approver or Admin to provide the first approval for an invoice above 500,000, followed by approval from a Director with a different username. The invoice SHALL remain pending after only the first approval and SHALL become approved only after the Director's second approval.

#### Scenario: First approval is recorded without final approval
- **WHEN** an Approver or Admin approves a pending invoice for more than 500,000
- **THEN** the first approval is recorded and the invoice remains pending

#### Scenario: Distinct Director completes high-value approval
- **WHEN** a Director with a different username approves a high-value invoice that has its first approval recorded
- **THEN** the invoice becomes approved and both approvers are recorded

#### Scenario: Same user cannot provide both approvals
- **WHEN** the username recorded as the first approver attempts to provide the second approval as a Director
- **THEN** the attempt is rejected with a clear reason and the invoice remains unchanged from its state after the first approval

#### Scenario: Director cannot provide the first approval for a high-value invoice
- **WHEN** a Director attempts to approve an invoice above 500,000 that has no first approval
- **THEN** the attempt is rejected with a clear reason and the invoice remains unchanged

#### Scenario: Manager cannot provide a high-value first approval
- **WHEN** a Manager attempts to approve an invoice above 500,000 that has no first approval
- **THEN** the attempt is rejected with a clear reason and the invoice remains unchanged

### Requirement: Rejected approval attempts do not mutate invoices
The system SHALL return a clear reason when an approval attempt is rejected by a role, amount, or distinct-approver rule, and SHALL leave the invoice's status, recorded approvals, decision data, and other persisted fields unchanged.

#### Scenario: Rejected attempt preserves invoice data
- **WHEN** an approval attempt violates an approval rule
- **THEN** the caller receives a clear rejection reason and no invoice data or persisted state is changed by that attempt
