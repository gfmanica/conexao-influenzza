import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { Architect } from '@/routes/(app)/architects/-types';
import { createPointSchema, updatePointSchema, type Point } from '@/routes/(app)/points/-types';

import { createPoint, updatePoint } from '../-server';

type UseFormPointArgs = {
    entry?: Point;
};

export function useFormPoint({ entry }: UseFormPointArgs = {}) {
    const queryClient = useQueryClient();

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
            try {
                if (value.id) {
                    await updatePoint({ data: value });
                } else {
                    await createPoint({ data: value });
                }

                queryClient.invalidateQueries({ queryKey: ['points'] });
                queryClient.invalidateQueries({ queryKey: ['architects'] });
                queryClient.invalidateQueries({ queryKey: ['ranking'] });

                toast.success('Lançamento salvo com sucesso!');
            } catch (error: any) {
                toast.error(error?.message ?? 'Erro ao salvar lançamento');
            }
        },
        validators: {
            onSubmit: ({ value }) => {
                const result = value.id
                    ? updatePointSchema.safeParse(value)
                    : createPointSchema.safeParse(value);

                if (result.success) return undefined;

                const firstIssue = result.error.issues[0];
                if (firstIssue?.path.length) {
                    return {
                        fields: {
                            [firstIssue.path.join('.')]: firstIssue.message
                        }
                    };
                }

                return firstIssue?.message ?? 'Formulário inválido';
            }
        }
    });
}
