import { createServerFn } from '@tanstack/react-start';
import { and, count, eq, sum } from 'drizzle-orm';
import { z } from 'zod/v4';

import { db } from '@/lib/db';
import {
    buildOrderByClause,
    buildPagedResponse,
    buildWhereConditions,
    getPaginationRange
} from '@/lib/db/builders';
import { pointEntries, user } from '@/lib/db/schema';
import { createArchitectSchema, updateArchitectSchema } from '@/types/architect';
import { queryParamsSchema } from '@/types/builders';

const architectColumns = {
    id: user.id,
    name: user.name,
    email: user.email,
    office_email: user.officeEmail,
    phone: user.phone,
    office_address: user.officeAddress,
    birthdate: user.birthdate,
    cau_register: user.cauRegister,
    observation: user.observation,
    photo_url: user.photoUrl,
    created_at: user.createdAt,
    updated_at: user.updatedAt,
    role: user.role
};

/**
 * Faz um findAll dos usuários arquitetos.
 */
export const listArchitects = createServerFn({ method: 'GET' })
    .inputValidator(queryParamsSchema)
    .handler(async ({ data }) => {
        const filter = data?.filter ?? [];

        filter.push({
            field: 'role',
            operator: 'eq',
            value: 'architect'
        });

        const { offset, limit } = getPaginationRange(data?.page, data?.pageSize);
        const where = buildWhereConditions(filter, architectColumns);
        const orderBy = buildOrderByClause(data?.order ?? [], architectColumns);

        const [{ total }] = await db.select({ total: count() }).from(user).where(where);

        const rows = await db
            .select({
                ...architectColumns,
                total_points: sum(pointEntries.amount)
            })
            .from(user)
            .leftJoin(pointEntries, eq(user.id, pointEntries.userId))
            .where(where)
            .groupBy(user.id)
            .orderBy(...(orderBy.length ? orderBy : [user.name]))
            .limit(limit)
            .offset(offset);

        return buildPagedResponse(rows, total, offset, limit);
    });

/**
 * Faz um findOne do usuário arquiteto pelo id.
 */
export const getArchitect = createServerFn({ method: 'GET' })
    .inputValidator(z.object({ id: z.uuid() }))
    .handler(async ({ data }) => {
        const architect = await db.query.user.findFirst({
            where: and(eq(user.id, data.id), eq(user.role, 'architect'))
        });

        if (!architect) throw new Error('Arquiteto não encontrado.');

        return {
            id: architect.id,
            name: architect.name,
            email: architect.email,
            office_email: architect.officeEmail,
            phone: architect.phone,
            office_address: architect.officeAddress,
            birthdate: architect.birthdate,
            cau_register: architect.cauRegister,
            observation: architect.observation,
            photo_url: architect.photoUrl,
            created_at: architect.createdAt,
            updated_at: architect.updatedAt
        };
    });
/**
 * Insere um novo arquiteto.
 */
export const createArchitect = createServerFn({ method: 'POST' })
    .inputValidator(createArchitectSchema)
    .handler(async ({ data }) => {
        try {
            const [architect] = await db
                .insert(user)
                .values({
                    name: data.name,
                    email: data.email,
                    emailVerified: false,
                    role: 'architect',
                    officeEmail: data.office_email,
                    phone: data.phone,
                    officeAddress: data.office_address,
                    birthdate: data.birthdate,
                    cauRegister: data.cau_register,
                    observation: data.observation,
                    photoUrl: data.photo_url
                })
                .returning(architectColumns);

            return architect;
        } catch (e: unknown) {
            if (e instanceof Error && e.message.includes('UNIQUE')) {
                throw new Error('E-mail já cadastrado.');
            }

            throw e;
        }
    });

/**
 * Atualiza um arquiteto.
 */
export const updateArchitect = createServerFn({ method: 'POST' })
    .inputValidator(updateArchitectSchema)
    .handler(async ({ data }) => {
        const [architect] = await db
            .update(user)
            .set({
                name: data.name,
                officeEmail: data.office_email,
                phone: data.phone,
                officeAddress: data.office_address,
                birthdate: data.birthdate,
                cauRegister: data.cau_register,
                observation: data.observation,
                updatedAt: new Date()
            })
            .where(and(eq(user.id, data.id), eq(user.role, 'architect')))
            .returning(architectColumns);

        if (!architect) throw new Error('Arquiteto não encontrado.');

        return architect;
    });
