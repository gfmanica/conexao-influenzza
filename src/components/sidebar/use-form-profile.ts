import type { RefObject } from 'react';

import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { toast } from 'sonner';

import { updateProfile } from '@/server/profile';
import { uploadOwnAvatar } from '@/server/storage';

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export type ProfileUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    photoUrl?: string | null;
    officeEmail?: string | null;
    phone?: string | null;
    officeAddress?: string | null;
    birthdate?: string | null;
    cauRegister?: string | null;
    observation?: string | null;
};

type UseFormProfileArgs = {
    user: ProfileUser;
    photoFileRef: RefObject<File | null>;
    onSuccess: () => void;
};

export function useFormProfile({ user, photoFileRef, onSuccess }: UseFormProfileArgs) {
    const router = useRouter();

    return useForm({
        defaultValues: {
            name: user.name ?? '',
            officeEmail: user.officeEmail ?? '',
            phone: user.phone ?? '',
            officeAddress: user.officeAddress ?? '',
            birthdate: user.birthdate ?? '',
            cauRegister: user.cauRegister ?? '',
            observation: user.observation ?? '',
            photoUrl: user.photoUrl ?? ''
        },
        onSubmit: async ({ value }) => {
            try {
                if (photoFileRef.current) {
                    const file = photoFileRef.current;
                    value.photoUrl = await uploadOwnAvatar({
                        data: {
                            fileBase64: await fileToBase64(file),
                            fileName: file.name,
                            contentType: file.type
                        }
                    });
                }

                await updateProfile({ data: value });

                toast.success('Perfil atualizado com sucesso!');
                onSuccess();

                await router.invalidate();
            } catch (error) {
                toast.error(error instanceof Error ? error.message : 'Erro ao atualizar perfil.');
            }
        },
        validators: {
            onSubmit: ({ value }) => {
                if (!value.name.trim()) {
                    return {
                        fields: {
                            name: 'Nome é obrigatório'
                        }
                    };
                }
                return undefined;
            }
        }
    });
}
