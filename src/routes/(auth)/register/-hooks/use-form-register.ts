import type { RefObject } from 'react';

import { useForm } from '@tanstack/react-form';

import { registerArchitect } from '@/routes/(app)/architects/-server';
import { registerArchitectSchema } from '@/routes/(app)/architects/-types';

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

type UseFormRegisterArgs = {
    photoFileRef: RefObject<File | null>;
    onSuccess: (name: string) => void;
};

export function useFormRegister({ photoFileRef, onSuccess }: UseFormRegisterArgs) {
    return useForm({
        defaultValues: {
            name: '',
            email: '',
            officeEmail: '',
            phone: '',
            officeAddress: '',
            birthdate: '',
            cauRegister: ''
        },
        onSubmit: async ({ value }) => {
            try {
                let photoBase64: string | undefined;
                let photoFileName: string | undefined;
                let photoContentType: string | undefined;

                if (photoFileRef.current) {
                    const file = photoFileRef.current;
                    photoBase64 = await fileToBase64(file);
                    photoFileName = file.name;
                    photoContentType = file.type;
                }

                const result = await registerArchitect({
                    data: { ...value, photoBase64, photoFileName, photoContentType }
                });
                onSuccess(result.name);
            } catch (e: unknown) {
                console.log(e);
            }
        },
        validators: {
            onSubmit: ({ value }) => {
                const result = registerArchitectSchema.safeParse(value);
                if (!result.success) {
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
                return undefined;
            }
        }
    });
}
