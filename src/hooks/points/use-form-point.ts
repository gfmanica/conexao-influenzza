import { useForm } from '@tanstack/react-form';

import { createPointEntrySchema, updatePointEntrySchema } from '@/types/point-entry';

import { useCreatePointEntry, useUpdatePointEntry } from './use-point-entries';

export function useFormPoint() {
    const createMutation = useCreatePointEntry();
    const updateMutation = useUpdatePointEntry();

    return useForm({
        defaultValues: {
            id: '',
            architect: null,
            pointType: '',
            amount: 0,
            entryDate: new Date().toISOString().split('T')[0]
        },
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
                    ? updatePointEntrySchema.safeParse(value)
                    : createPointEntrySchema.safeParse(value);

                if (!result.success) {
                    return result.error.issues[0]?.message ?? 'Formulário inválido';
                }

                return undefined;
            }
        }
    });
}
