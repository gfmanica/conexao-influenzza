import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { eq } from 'drizzle-orm';

import { sendMagicLinkEmail } from '@/lib/email';

import { db } from '../db';
import { user, userRoleEnum } from '../db/schema';

export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    user: {
        additionalFields: {
            role: {
                type: userRoleEnum.enumValues,
                defaultValue: 'architect',
                input: false
            },
            officeEmail: { type: 'string', required: false },
            phone: { type: 'string', required: false },
            officeAddress: { type: 'string', required: false },
            birthdate: { type: 'string', required: false },
            cauRegister: { type: 'string', required: false },
            observation: { type: 'string', required: false },
            photoUrl: { type: 'string', required: false }
        }
    },
    plugins: [
        tanstackStartCookies(),
        magicLink({
            sendMagicLink: async ({ email, url }) => {
                const existingUser = await db.query.user.findFirst({
                    where: eq(user.email, email)
                });

                if (!existingUser) throw new Error('E-mail não cadastrado no sistema.');

                await sendMagicLinkEmail(email, url);
            },
            expiresIn: 60 * 15
        })
    ],
    session: {
        cookieCache: { enabled: true, maxAge: 60 * 3 }
    },
    advanced: {
        database: {
            generateId: 'uuid'
        }
    }
});
