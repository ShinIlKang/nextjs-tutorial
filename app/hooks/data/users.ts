import prisma from '../../../prisma/client';

export async function getUser(email: string) {
    try {
        const user = await prisma.users.findUnique({
            where: {
                email: email
            }
        });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}