import { Page } from '@playwright/test';

export class InvoiceApprovalsPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/');
  }

  async signIn(username: string, password: string) {
    await this.page.getByLabel('Username').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async signOut() {
    await this.page.getByRole('button', { name: 'Sign out' }).click();
  }

  async createInvoice(customerName: string, amount: string) {
    await this.page.getByLabel('Customer name').fill(customerName);
    await this.page.getByLabel('Amount').fill(amount);
    await this.page.getByRole('button', { name: 'Create invoice' }).click();
  }

  async submitInvoiceForCustomer(customerName: string) {
    const invoiceRow = this.page.getByRole('row').filter({ hasText: customerName });
    await invoiceRow.getByRole('button', { name: /Submit invoice .* for approval/ }).click();
  }

  async openPendingApprovals() {
    await this.page.getByRole('tab', { name: 'Approvals' }).click();
  }

  async approveInvoiceForCustomer(customerName: string) {
    const pendingInvoice = this.page.getByRole('listitem').filter({ hasText: customerName });
    await pendingInvoice.getByRole('button', { name: /Approve invoice/ }).click();
    return pendingInvoice;
  }
}
