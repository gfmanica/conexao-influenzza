import type { RefObject } from 'react';

import { useForm } from '@tanstack/react-form';

import {
    createArchitectSchema,
    updateArchitectSchema,
    type Architect
} from '@/routes/(app)/architects/-types';
import { uploadAvatar } from '@/server/storage';

import { useCreateArchitect, useUpdateArchitect } from './use-architects';

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

type UseFormArchitectArgs = {
    architect?: Architect;
    photoFileRef?: RefObject<File | null>;
};

export function useFormArchitect({ architect, photoFileRef }: UseFormArchitectArgs) {
    const createArchitectMutation = useCreateArchitect();
    const updateArchitectMutation = useUpdateArchitect();

    return useForm({
        defaultValues: {
            id: architect?.id ?? '',
            name: architect?.name ?? '',
            email: architect?.email ?? '',
            officeEmail: architect?.officeEmail ?? '',
            phone: architect?.phone ?? '',
            officeAddress: architect?.officeAddress ?? '',
            birthdate: architect?.birthdate ?? '',
            cauRegister: architect?.cauRegister ?? '',
            observation: architect?.observation ?? '',
            photoUrl: architect?.photoUrl ?? ''
        },
        onSubmit: async ({ value }) => {
            if (photoFileRef?.current) {
                const file = photoFileRef.current;
                value.photoUrl = await uploadAvatar({
                    data: {
                        fileBase64: await fileToBase64(file),
                        fileName: file.name,
                        contentType: file.type,
                        email: value.email
                    }
                });
            }

            if (value.id) {
                await updateArchitectMutation.mutateAsync({ data: value });
            } else {
                await createArchitectMutation.mutateAsync({ data: value });
            }
        },
        validators: {
            onSubmit: ({ value }) => {
                const result = value.id
                    ? updateArchitectSchema.safeParse(value)
                    : createArchitectSchema.safeParse(value);

                if (!result.success) {
                    return result.error.issues[0]?.message ?? 'Formulário inválido';
                }

                return undefined;
            }
        }
    });
}
