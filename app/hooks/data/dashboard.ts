import { unstable_noStore as noStore } from 'next/cache';
import prisma from '../../../prisma/client';

export async function fetchCardData() {
    noStore();
    try {
        // You can probably combine these into a single SQL query
        // However, we are intentionally splitting them to demonstrate
        // how to initialize multiple queries in parallel with JS.
        const invoiceCountPromise = prisma.invoices.count();
        const customerCountPromise = prisma.customers.count();
        const invoicePaidPromise = prisma.invoices.groupBy({
            by: ['status'],
            _sum: {
                amount: true,
            },
            having: {
                status: 'paid',
            },
        });
        const invoicePendingPromise = prisma.invoices.groupBy({
            by: ['status'],
            _sum: {
                amount: true,
            },
            having: {
                status: 'pending',
            },
        });

        const data = await Promise.all([
            invoiceCountPromise,
            customerCountPromise,
            invoicePaidPromise,
            invoicePendingPromise,
        ]);

        const numberOfInvoices = data[0];
        const numberOfCustomers = data[1];
        const totalPaidInvoices = data[2].reduce((acc, curr) => acc + (curr?._sum?.amount || 0), 0);
        const totalPendingInvoices = data[3].reduce((acc, curr) => acc + (curr?._sum?.amount || 0), 0);

        return {
            numberOfCustomers,
            numberOfInvoices,
            totalPaidInvoices,
            totalPendingInvoices,
        };
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch card data.');
    }
}