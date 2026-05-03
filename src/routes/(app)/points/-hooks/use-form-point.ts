import { useForm } from '@tanstack/react-form';

import type { Architect } from '@/routes/(app)/architects/-types';
import { useCreatePoint, useUpdatePoint } from '@/routes/(app)/points/-hooks/use-points';
import { createPointSchema, updatePointSchema, type Point } from '@/routes/(app)/points/-types';

type UseFormPointArgs = {
    entry?: Point;
};

export function useFormPoint({ entry }: UseFormPointArgs = {}) {
    const createMutation = useCreatePoint();
    const updateMutation = useUpdatePoint();

    const getEntryDate = () => {
        if (!entry?.entryDate) return new Date().toISOString().split('T')[0];
        return typeof entry.entryDate === 'string'
            ? entry.entryDate
            : entry.entryDate.toISOString().split('T')[0];
    };

    return useForm({
        defaultValues: {
            id: entry?.id ?? '',
            architect: (entry?.architect as Architect | null) ?? null,
            pointType: entry?.pointType ?? '',
            amount: entry?.amount ?? 0,
            entryDate: getEntryDate()
        } as any,
        onSubmit: async ({ value }) => {
            if (value.id) {
                await updateMutation.mutateAsync({ data: value });
            } else {
                await createMutation.mutateAsync({ data: value });
            }
        },
        validators: {
            onSubmit: ({ value }) => {
                const result = value.id
                    ? updatePointSchema.safeParse(value)
                    : createPointSchema.safeParse(value);

                if (!result.success) {
                    return result.error.issues[0]?.message ?? 'Formulário inválido';
                }

                return undefined;
            }
        }
    });
}
