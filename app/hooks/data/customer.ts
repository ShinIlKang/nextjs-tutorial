import { unstable_noStore as noStore } from 'next/cache';
import prisma from '../../../prisma/client';
import { formatCurrency } from '@/app/lib/utils';

export async function fetchCustomers() {
    try {
        const customers = await prisma.customers.findMany();
        return customers;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch all customers.');
    }
}

export async function fetchFilteredCustomers(query: string) {
    noStore();
    try {
        const data = await prisma.customers.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                image_url: true,
                invoices: {
                    select: {
                        id: true,
                        status: true,
                    }
                }
            },
            where: {
                OR: [
                    { name: { contains: query } },
                    { email: { contains: query } },
                ],
            },
            orderBy: {
                name: 'asc'
            },
        });

        const customers = data.map((customer) => ({
            ...customer,
            totalInvoices: customer.invoices.length,
            totalPending: formatCurrency(customer.invoices.filter((invoice) => invoice.status === 'pending').length),
            totalPaid: formatCurrency(customer.invoices.filter((invoice) => invoice.status === 'paid').length),
        }));

        return customers;
    } catch (err) {
        console.error('Database Error:', err);
        throw new Error('Failed to fetch customer table.');
    }
}