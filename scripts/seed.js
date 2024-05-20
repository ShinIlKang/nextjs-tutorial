const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

async function seedUsers() {
  try {
    // Insert data into the "users" table
    const insertUsers = await Promise.all(
        users.map(async (user) => {
            user.password = await bcrypt.hash(user.password, 10);
            return prisma.users.create({
                data: user
            });
        })
    );

    console.log(`Seeded ${insertUsers.length} users`);

    return {
      users: insertUsers,
    };

  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    // Insert data into the "invoices" table
    invoices.map((invoice) => {
        invoice.date = new Date(invoice.date);
    });
    
    const insertedInvoices = await prisma.invoices.createMany({
        data: invoices
    });

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return {
      invoices: insertedInvoices,
    };
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    // Insert data into the "customers" table
    const insertedCustomers = await prisma.customers.createMany({
        data: customers
    });

    console.log(`Seeded ${insertedCustomers.length} customers`);

    return {
      customers: insertedCustomers,
    };

  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedRevenue() {
  try {
    const insertedRevenue = await prisma.revenue.createMany({
        data: revenue
    });

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return {
      revenue: insertedRevenue,
    };
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}

async function main() {
//   await seedUsers();
//   await seedCustomers();
  await seedInvoices();
  await seedRevenue();
}

main().catch((err) => {
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
