import { expect, test } from '@playwright/test';
import { InvoiceApprovalsPage } from '../pages/InvoiceApprovalsPage';

test('clears messages when a different user signs in', async ({ page }) => {
  const approvalsPage = new InvoiceApprovalsPage(page);
  const customerName = `Session Message ${Date.now()}`;

  await approvalsPage.open();
  await approvalsPage.signIn('demo.manager', 'ChangeMe123!');
  await approvalsPage.createInvoice(customerName, '50000.01');
  await approvalsPage.submitInvoiceForCustomer(customerName);
  await approvalsPage.openPendingApprovals();

  await approvalsPage.approveInvoiceForCustomer(customerName);
  await expect(page.getByRole('alert')).toContainText('approval limit');

  await approvalsPage.signOut();
  await approvalsPage.signIn('demo.director', 'ChangeMe123!');

  await expect(page.getByRole('alert')).toBeHidden();
});

test('does not show an old approval error after switching accounts', async ({ page }) => {
  const approvalsPage = new InvoiceApprovalsPage(page);
  const customerName = `Delayed Approval ${Date.now()}`;
  let releaseApprovalResponse: () => void = () => {};
  let notifyApprovalRequest: () => void = () => {};
  const approvalRequestReceived = new Promise<void>((resolve) => {
    notifyApprovalRequest = resolve;
  });
  const responseGate = new Promise<void>((resolve) => {
    releaseApprovalResponse = resolve;
  });

  await page.route('**/api/approvals/*/approve', async (route) => {
    notifyApprovalRequest();
    await responseGate;
    await route.fulfill({
      status: 409,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'The Manager approval limit is 50,000.' })
    });
  });

  await approvalsPage.open();
  await approvalsPage.signIn('demo.manager', 'ChangeMe123!');
  await approvalsPage.createInvoice(customerName, '50000.01');
  await approvalsPage.submitInvoiceForCustomer(customerName);
  await approvalsPage.openPendingApprovals();

  const pendingInvoice = page.getByRole('listitem').filter({ hasText: customerName });
  await pendingInvoice.getByRole('button', { name: /Approve invoice/ }).click();
  await approvalRequestReceived;

  await approvalsPage.signOut();
  await approvalsPage.signIn('demo.director', 'ChangeMe123!');

  const approvalResponse = page.waitForResponse((response) =>
    response.url().includes('/api/approvals/') && response.url().endsWith('/approve')
  );
  releaseApprovalResponse();
  await approvalResponse;

  await expect(page.getByRole('alert')).toBeHidden();
});
