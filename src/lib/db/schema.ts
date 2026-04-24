import { relations } from 'drizzle-orm';
import {
    boolean,
    date,
    index,
    integer,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['admin', 'architect']);

export const user = pgTable('user', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: varchar('image', { length: 2048 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),

    role: userRoleEnum('role').default('architect').notNull(),
    officeEmail: varchar('office_email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    officeAddress: varchar('office_address', { length: 500 }),
    birthdate: date('birthdate'),
    cauRegister: varchar('cau_register', { length: 50 }),
    observation: text('observation'),
    photoUrl: text('photo_url')
});

export const session = pgTable(
    'session',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
        token: varchar('token', { length: 255 }).notNull().unique(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .$onUpdate(() => new Date())
            .notNull(),
        ipAddress: varchar('ip_address', { length: 45 }),
        userAgent: text('user_agent'),
        userId: uuid('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' })
    },
    (table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
    'account',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        accountId: varchar('account_id', { length: 255 }).notNull(),
        providerId: varchar('provider_id', { length: 255 }).notNull(),
        userId: uuid('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        idToken: text('id_token'),
        accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
        refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
        scope: text('scope'),
        password: text('password'),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .$onUpdate(() => new Date())
            .notNull()
    },
    (table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
    'verification',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        identifier: varchar('identifier', { length: 255 }).notNull(),
        value: text('value').notNull(),
        expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true })
            .defaultNow()
            .$onUpdate(() => new Date())
            .notNull()
    },
    (table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const pointEntries = pgTable('point_entries', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => user.id, { onDelete: 'cascade' }),
    pointType: varchar('point_type', { length: 100 }).notNull(),
    amount: integer('amount').notNull(),
    entryDate: timestamp('entry_date', { withTimezone: true }).notNull(),
    createdBy: varchar('created_by', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull()
});

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account)
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id]
    })
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id]
    })
}));

export const pointEntriesRelations = relations(pointEntries, ({ one }) => ({
    architect: one(user, {
        fields: [pointEntries.userId],
        references: [user.id]
    })
}));
