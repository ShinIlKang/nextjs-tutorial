import prisma from "./client";
import { invoices, customers, revenue, users } from "../app/lib/placeholder-data";
import bcrypt from 'bcrypt';

async function main() {
    const insertUsers = await Promise.all(
        users.map(async (user) => {
            user.password = await bcrypt.hash(user.password, 10);
            return prisma.users.create({
                data: user
            });
        })
    );

    await prisma.users.createMany({
        data: users
    });

    await prisma.invoices.createMany({
        data: invoices
    });

    await prisma.customers.createMany({
        data: customers
    });

    await prisma.revenue.createMany({
        data: revenue
    });
}

main()
    .catch((e) => {
        console.log(e);
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });