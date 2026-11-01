import { expect, test } from '@playwright/test';
import { InvoiceApprovalsPage } from '../pages/InvoiceApprovalsPage';

test('shows the next required approver after the first high-value approval', async ({ page }) => {
  const approvalsPage = new InvoiceApprovalsPage(page);
  const customerName = `Approval Progress ${Date.now()}`;

  await approvalsPage.open();
  await approvalsPage.signIn('demo.approver', 'ChangeMe123!');
  await approvalsPage.createInvoice(customerName, '500000.01');
  await approvalsPage.submitInvoiceForCustomer(customerName);
  await approvalsPage.openPendingApprovals();

  const pendingInvoice = await approvalsPage.approveInvoiceForCustomer(customerName);

  await expect(pendingInvoice.getByRole('status')).toHaveText(
    'First approval recorded by demo.approver. Only a different Director can provide the second approval.'
  );
});

test('shows an over-limit approval rejection and leaves the invoice pending', async ({ page }) => {
  const approvalsPage = new InvoiceApprovalsPage(page);
  const customerName = `Over Limit Approval ${Date.now()}`;

  await approvalsPage.open();
  await approvalsPage.signIn('demo.manager', 'ChangeMe123!');
  await approvalsPage.createInvoice(customerName, '50000.01');
  await approvalsPage.submitInvoiceForCustomer(customerName);
  await approvalsPage.openPendingApprovals();
  await approvalsPage.approveInvoiceForCustomer(customerName);

  await expect(page.getByRole('alert')).toHaveText('The Manager approval limit is 50,000.');

  await page.getByRole('tab', { name: 'Invoices' }).click();
  const invoiceRow = page.getByRole('row').filter({ hasText: customerName });
  await expect(invoiceRow.getByRole('cell').nth(3)).toHaveText('Pending Approval');
});

test('requires a distinct Director to complete a high-value approval', async ({ page }) => {
  const approvalsPage = new InvoiceApprovalsPage(page);
  const customerName = `Two Approver Completion ${Date.now()}`;

  await approvalsPage.open();
  await approvalsPage.signIn('demo.approver', 'ChangeMe123!');
  await approvalsPage.createInvoice(customerName, '500000.01');
  await approvalsPage.submitInvoiceForCustomer(customerName);
  await approvalsPage.openPendingApprovals();
  await approvalsPage.approveInvoiceForCustomer(customerName);
  await expect(page.getByRole('listitem').filter({ hasText: customerName }).getByRole('status'))
    .toContainText('Only a different Director can provide the second approval');

  await approvalsPage.signOut();
  await approvalsPage.signIn('demo.director', 'ChangeMe123!');
  await approvalsPage.openPendingApprovals();
  await approvalsPage.approveInvoiceForCustomer(customerName);

  await page.getByRole('tab', { name: 'Invoices' }).click();
  const invoiceRow = page.getByRole('row').filter({ hasText: customerName });
  await expect(invoiceRow.getByRole('cell').nth(3)).toHaveText('Approved');
});

test('disables approval for non-Directors after Admin records the first approval', async ({ page }) => {
  const approvalsPage = new InvoiceApprovalsPage(page);
  const customerName = `Admin First Approval ${Date.now()}`;

  await approvalsPage.open();
  await approvalsPage.signIn('demo.admin', 'ChangeMe123!');
  await approvalsPage.createInvoice(customerName, '900000');
  await approvalsPage.submitInvoiceForCustomer(customerName);
  await approvalsPage.openPendingApprovals();
  await approvalsPage.approveInvoiceForCustomer(customerName);

  await approvalsPage.signOut();
  for (const account of [
    { username: 'demo.approver', role: 'Approver' },
    { username: 'demo.manager', role: 'Manager' }
  ]) {
    await approvalsPage.signIn(account.username, 'ChangeMe123!');
    await approvalsPage.openPendingApprovals();

    const pendingInvoice = page.getByRole('listitem').filter({ hasText: customerName });
    await expect(pendingInvoice.getByRole('status')).toHaveText(
      'First approval recorded by demo.admin. Only a different Director can provide the second approval.'
    );
    await expect(pendingInvoice.getByRole('button', { name: /Approve invoice/ })).toBeDisabled();

    await approvalsPage.signOut();
  }

  await approvalsPage.signIn('demo.director', 'ChangeMe123!');
  await approvalsPage.openPendingApprovals();
  const pendingInvoice = page.getByRole('listitem').filter({ hasText: customerName });
  await expect(pendingInvoice.getByRole('button', { name: /Approve invoice/ })).toBeEnabled();
  await approvalsPage.approveInvoiceForCustomer(customerName);

  await page.getByRole('tab', { name: 'Invoices' }).click();
  const invoiceRow = page.getByRole('row').filter({ hasText: customerName });
  await expect(invoiceRow.getByRole('cell').nth(3)).toHaveText('Approved');
});
