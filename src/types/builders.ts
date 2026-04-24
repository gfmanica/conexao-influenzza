import { z } from 'zod/v4';

const filterOperators = [
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'like',
    'ilike',
    'in',
    'is'
] as const;

const filterValueSchema = z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.union([z.string(), z.number(), z.boolean()]))
]);

const filterItemSchema = z.object({
    field: z.string(),
    operator: z.enum(filterOperators),
    value: filterValueSchema
});

const orderItemSchema = z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']).default('asc'),
    nullsFirst: z.boolean().optional()
});

export const queryParamsSchema = z
    .object({
        page: z.int().min(1).optional(),
        pageSize: z.int().min(1).optional(),
        filter: z.array(filterItemSchema).optional(),
        order: z.array(orderItemSchema).optional()
    })
    .optional();

export type FilterItem = z.infer<typeof filterItemSchema>;

export type OrderItem = z.infer<typeof orderItemSchema>;

export type QueryParams = z.infer<typeof queryParamsSchema>;
