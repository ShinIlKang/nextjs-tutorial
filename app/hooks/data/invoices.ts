import { formatCurrency } from "@/app/lib/utils";
import { unstable_noStore as noStore } from 'next/cache';
import prisma from '../../../prisma/client';
import { invoices } from "@prisma/client";
import { InvoiceForm } from "@/app/lib/definitions";

export async function fetchLatestInvoices() {
    noStore();
    try {
        const data = await prisma.invoices.findMany({
            select: {
                amount: true
                , id: true
                , customer: {
                    select: {
                        name: true
                        , email: true
                        , image_url: true
                    }
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: 5
        });

        const latestInvoices = data.map((invoice) => ({
            ...invoice,
            amount: formatCurrency(invoice.amount),
        }));

        return latestInvoices;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch the latest invoices.');
    }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
    query: string,
    currentPage: number,
) {
    noStore();
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const dateQuery = new Date(query);
        const isValidDate = !isNaN(dateQuery.getTime());
        const numberAmount = Number(query);
        const isValidNumber = !isNaN(numberAmount);

        const invoices = await prisma.invoices.findMany({
            select: {
                id: true,
                amount: true,
                date: true,
                status: true,
                customer: {
                    select: {
                        name: true,
                        email: true,
                        image_url: true
                    }
                }
            },
            where: {
                OR: [
                    { customer: { name: { contains: query } } },
                    { customer: { email: { contains: query } } },
                    { amount: isValidNumber ? Number(query) : undefined },
                    { date: isValidDate ? { equals: dateQuery } : undefined },
                    { status: { contains: query } }
                ]
            },
            orderBy: {
                date: 'desc'
            },
            take: ITEMS_PER_PAGE,
            skip: offset
        });

        return invoices;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoices.');
    }
}

export async function fetchInvoicesPages(query: string) {
    noStore();
    try {
        const dateQuery = new Date(query);
        const isValidDate = !isNaN(dateQuery.getTime());
        const numberAmount = Number(query);
        const isValidNumber = !isNaN(numberAmount);

        const count = await prisma.invoices.count({
            where: {
                OR: [
                    { customer: { name: { contains: query } } },
                    { customer: { email: { contains: query } } },
                    { amount: isValidNumber ? Number(query) : undefined },
                    { date: isValidDate ? { equals: dateQuery } : undefined },
                    { status: { contains: query } }
                ]
            }
        });

        const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
        return totalPages;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch total number of invoices.');
    }
}

export async function fetchInvoiceById(id: string) {
    noStore();
    try {
        prisma.$extends({
            result: {
                invoices: {
                    amount: {
                        needs: { amount: true },
                        compute(invoice) {
                            return invoice.amount / 100;
                        }
                    }
                }
            }
        });

        const data = await prisma.invoices.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                customer_id: true,
                amount: true,
                status: true,
            }
        });

        let invoice: InvoiceForm | null = null;
        if (data) {
            invoice = {
                id: data.id,
                customer_id: data.customer_id,
                amount: data.amount,
                status: data.status === 'paid' ? 'paid' : 'pending',
            };
        }
        return invoice;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch invoice.');
    }
}