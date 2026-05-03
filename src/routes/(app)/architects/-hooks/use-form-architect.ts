import type { RefObject } from 'react';

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
    createArchitectSchema,
    updateArchitectSchema,
    type Architect
} from '@/routes/(app)/architects/-types';
import { uploadAvatar } from '@/server/storage';

import { createArchitect, updateArchitect } from '../-server';

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
    const queryClient = useQueryClient();

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

            try {
                if (value.id) {
                    await updateArchitect({ data: value });
                } else {
                    await createArchitect({ data: value });
                }

                queryClient.invalidateQueries({ queryKey: ['architects'] });

                toast.success('Arquiteto salvo com sucesso!');
            } catch (e: any) {
                toast.error(e?.message ?? 'Erro ao salvar arquiteto');
            }
        },
        validators: {
            onSubmit: ({ value }) => {
                const result = value.id
                    ? updateArchitectSchema.safeParse(value)
                    : createArchitectSchema.safeParse(value);

                if (result.success) return undefined;

                return result.error.issues[0]?.message ?? 'Formulário inválido';
            }
        }
    });
}
