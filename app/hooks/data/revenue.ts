import { unstable_noStore as noStore } from 'next/cache';
import prisma from '../../../prisma/client';
import { Revenue } from '@/app/lib/definitions';

export async function fetchRevenue() {
    // Add noStore() here to prevent the response from being cached.
    // This is equivalent to in fetch(..., {cache: 'no-store'}).
    noStore();
    try {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const revenues: Revenue[] = await prisma.revenue.findMany();

        console.log('Data fetch completed after 3 seconds.');

        return revenues;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch revenue data.');
    }
}