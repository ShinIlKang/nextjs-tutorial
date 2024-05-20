'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '../../../prisma/client';

export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

const FromSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce
        .number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),
    status: z.enum(['pending', 'paid'], {
        invalid_type_error: 'Please select an invoice status.'
    }),
    date: z.string(),
});

const CreateInvoice = FromSchema.omit({ id: true, date: true });
const UpdateInvoice = FromSchema.omit({ id: true, date: true });

export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });
    // validation 체크
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Inovice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;
    const amoutInCents = amount * 100;
    const date = new Date().toISOString().split('T')[0];
    // database 오류 처리
    try {
        const invoice = await prisma.invoices.create({
            data: {
                customer_id: customerId,
                amount: amoutInCents,
                status,
                date,
            }
        });
    } catch (error) {
        return {
            message: 'Database Error: Faild to Create Invoice.'
        }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function updateInvoice(id: string, prevState: State, formData: FormData) {
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Update Invoice.',
        };
    }

    const { customerId, amount, status } = validatedFields.data;

    const amoutInCents = amount * 100;
    try {
        const updateInvoice = await prisma.invoices.update({
            where: {
                id: id
            },
            data: {
                customer_id: customerId,
                amount: amoutInCents,
                status,
            }
        });
    } catch (error) {
        return {
            message: 'Database Error: Faild to Update Invoice.'
        }
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    try {
        const deleteInvoice = await prisma.invoices.delete({
            where: {
                id: id
            }
        });
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice.' };
    } catch (error) {
        return {
            message: 'Database Error: Faild to Delete Invoice.'
        }
    }
}