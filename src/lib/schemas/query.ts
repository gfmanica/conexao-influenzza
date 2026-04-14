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

// type FilterOperator = (typeof filterOperators)[number];

const filterValueSchema = z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(z.union([z.string(), z.number(), z.boolean()]))
]);

// type FilterValue = z.infer<typeof filterValueSchema>;

const filterItemSchema = z.object({
    field: z.string(),
    operator: z.enum(filterOperators),
    value: filterValueSchema
});

export type FilterItem = z.infer<typeof filterItemSchema>;

const orderItemSchema = z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']).default('asc'),
    nullsFirst: z.boolean().optional()
});

export type OrderItem = z.infer<typeof orderItemSchema>;

export const queryParamsSchema = z
    .object({
        page: z.int().min(1).optional(),
        pageSize: z.int().min(1).optional(),
        filter: z.array(filterItemSchema).optional(),
        order: z.array(orderItemSchema).optional()
    })
    .optional();

export type QueryParams = z.infer<typeof queryParamsSchema>;
