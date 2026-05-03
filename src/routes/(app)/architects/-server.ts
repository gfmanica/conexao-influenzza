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
import { points, user } from '@/lib/db/schema';
import { adminMiddleware } from '@/lib/middleware';
import {
    createArchitectSchema,
    registerArchitectSchema,
    updateArchitectSchema
} from '@/routes/(app)/architects/-types';
import { queryParamsSchema } from '@/types/builders';

const architectColumns = {
    id: user.id,
    name: user.name,
    email: user.email,
    officeEmail: user.officeEmail,
    phone: user.phone,
    officeAddress: user.officeAddress,
    birthdate: user.birthdate,
    cauRegister: user.cauRegister,
    observation: user.observation,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    role: user.role
};

/**
 * Faz um findAll dos usuários arquitetos.
 */
export const listArchitects = createServerFn({ method: 'GET' })
    .middleware([adminMiddleware])
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
                totalPoints: sum(points.amount)
            })
            .from(user)
            .leftJoin(points, eq(user.id, points.userId))
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
    .middleware([adminMiddleware])
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
            officeEmail: architect.officeEmail,
            phone: architect.phone,
            officeAddress: architect.officeAddress,
            birthdate: architect.birthdate,
            cauRegister: architect.cauRegister,
            observation: architect.observation,
            photoUrl: architect.photoUrl,
            createdAt: architect.createdAt,
            updatedAt: architect.updatedAt
        };
    });
/**
 * Insere um novo arquiteto.
 */
export const createArchitect = createServerFn({ method: 'POST' })
    .middleware([adminMiddleware])
    .inputValidator(createArchitectSchema)
    .handler(async ({ data }) => {
        console.log(data);
        try {
            const [architect] = await db
                .insert(user)
                .values({
                    name: data.name,
                    email: data.email,
                    emailVerified: false,
                    role: 'architect',
                    officeEmail: data.officeEmail,
                    phone: data.phone,
                    officeAddress: data.officeAddress,
                    birthdate: data.birthdate,
                    cauRegister: data.cauRegister,
                    observation: data.observation,
                    photoUrl: data.photoUrl
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
 * Cadastro público de arquiteto (sem autenticação).
 */
export const registerArchitect = createServerFn({ method: 'POST' })
    .inputValidator(registerArchitectSchema)
    .handler(async ({ data }) => {
        try {
            const [architect] = await db
                .insert(user)
                .values({
                    name: data.name,
                    email: data.email,
                    emailVerified: false,
                    role: 'architect',
                    officeEmail: data.officeEmail,
                    phone: data.phone,
                    officeAddress: data.officeAddress,
                    birthdate: data.birthdate,
                    cauRegister: data.cauRegister
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
    .middleware([adminMiddleware])
    .inputValidator(updateArchitectSchema)
    .handler(async ({ data }) => {
        const [architect] = await db
            .update(user)
            .set({
                name: data.name,
                officeEmail: data.officeEmail,
                phone: data.phone,
                officeAddress: data.officeAddress,
                birthdate: data.birthdate,
                cauRegister: data.cauRegister,
                observation: data.observation,
                photoUrl: data.photoUrl,
                updatedAt: new Date()
            })
            .where(and(eq(user.id, data.id), eq(user.role, 'architect')))
            .returning(architectColumns);

        if (!architect) throw new Error('Arquiteto não encontrado.');

        return architect;
    });
