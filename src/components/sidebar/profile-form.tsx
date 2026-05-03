import { useEffect, useRef, useState } from 'react';

import { useForm } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import {
    CameraIcon,
    FileImageIcon,
    RotateCcwIcon,
    Trash2Icon
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArchitectAvatar } from '@/routes/(app)/architects/-components/architect-avatar';
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

type ProfileUser = {
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

type ProfileFormProps = {
    user: ProfileUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ProfileForm({ user, open, onOpenChange }: ProfileFormProps) {
    const isMobile = useIsMobile();
    const router = useRouter();
    const isArchitect = user.role === 'architect';

    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [photoFileName, setPhotoFileName] = useState<string>('');
    const photoFileRef = useRef<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm({
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
                onOpenChange(false);

                await router.invalidate();
            } catch (error) {
                toast.error(
                    error instanceof Error ? error.message : 'Erro ao atualizar perfil.'
                );
            }
        },
        validators: {
            onSubmit: ({ value }) => {
                if (!value.name.trim()) return 'Nome é obrigatório';
                return undefined;
            }
        }
    });

    useEffect(() => {
        if (!open) return;

        form.reset({
            name: user.name ?? '',
            officeEmail: user.officeEmail ?? '',
            phone: user.phone ?? '',
            officeAddress: user.officeAddress ?? '',
            birthdate: user.birthdate ?? '',
            cauRegister: user.cauRegister ?? '',
            observation: user.observation ?? '',
            photoUrl: user.photoUrl ?? ''
        });

        photoFileRef.current = null;
        setPhotoPreview('');
        setPhotoFileName('');

        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [open, user.id]);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) return;

        photoFileRef.current = file;
        setPhotoPreview(URL.createObjectURL(file));
        setPhotoFileName(file.name);
    }

    function handleDeletePhoto() {
        photoFileRef.current = null;
        setPhotoPreview('');
        setPhotoFileName('');
        form.setFieldValue('photoUrl', '');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleRestorePhoto() {
        photoFileRef.current = null;
        setPhotoPreview('');
        setPhotoFileName('');
        form.setFieldValue('photoUrl', user.photoUrl ?? '');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <Drawer direction={isMobile ? 'bottom' : 'right'} open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Editar Perfil</DrawerTitle>

                    <DrawerDescription>
                        Atualize seus dados pessoais.
                    </DrawerDescription>
                </DrawerHeader>

                <form
                    className="flex flex-col gap-5 overflow-y-auto px-4 py-2"
                    id="profile-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    {/* Photo */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="profile-photo">Foto</Label>

                        <input
                            ref={fileInputRef}
                            id="profile-photo"
                            name="photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />

                        <form.Subscribe
                            selector={(s) => [s.values.photoUrl, s.values.name] as const}
                        >
                            {([photoUrl, name]) => {
                                const currentPhoto = photoPreview || photoUrl;
                                const hasPhoto = !!currentPhoto;
                                const originalPhotoUrl = user.photoUrl ?? '';
                                const isDirty = !!photoFileName || photoUrl !== originalPhotoUrl;
                                const canRestore = isDirty;

                                return (
                                    <div className="bg-muted/40 flex flex-col items-center gap-4 rounded-xl border border-dashed p-6">
                                        <div className="relative">
                                            <ArchitectAvatar photoUrl={currentPhoto} name={name} />

                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="bg-background hover:bg-muted border-border absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border shadow-sm transition-colors"
                                            >
                                                <CameraIcon className="text-muted-foreground size-3.5" />
                                            </button>
                                        </div>

                                        {photoFileName ? (
                                            <div className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs">
                                                <FileImageIcon className="text-muted-foreground size-3.5 shrink-0" />
                                                <span className="text-foreground max-w-45 truncate font-medium">
                                                    {photoFileName}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-xs">
                                                {hasPhoto
                                                    ? 'Clique na câmera para alterar'
                                                    : 'Nenhuma foto selecionada'}
                                            </p>
                                        )}

                                        {(hasPhoto || canRestore) && (
                                            <div className="flex gap-2">
                                                {hasPhoto && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="xs"
                                                        onClick={handleDeletePhoto}
                                                    >
                                                        <Trash2Icon data-icon="inline-start" />
                                                        Excluir foto
                                                    </Button>
                                                )}

                                                {canRestore && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="xs"
                                                        onClick={handleRestorePhoto}
                                                    >
                                                        <RotateCcwIcon data-icon="inline-start" />
                                                        Restaurar original
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            }}
                        </form.Subscribe>
                    </div>

                    <Separator />

                    {/* Nome */}
                    <form.Field
                        name="name"
                        validators={{
                            onBlur: ({ value }) => {
                                if (!value.trim()) return 'Nome é obrigatório';
                                return undefined;
                            }
                        }}
                    >
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="profile-name">
                                    Nome completo <span className="text-destructive">*</span>
                                </Label>

                                <Input
                                    id="profile-name"
                                    placeholder="Ex: Ana Carolina Mendes"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-destructive text-xs">
                                        {field.state.meta.errors[0]?.toString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    {/* E-mail (read-only) */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="profile-email">E-mail</Label>
                        <Input
                            id="profile-email"
                            type="email"
                            value={user.email}
                            disabled
                        />
                        <p className="text-muted-foreground text-xs">
                            E-mail não pode ser alterado.
                        </p>
                    </div>

                    {/* Campos extras apenas para arquitetos */}
                    {isArchitect && (
                        <>
                            {/* E-mail do escritório */}
                            <form.Field
                                name="officeEmail"
                                validators={{
                                    onBlur: ({ value }) => {
                                        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                                            return 'E-mail inválido';
                                        return undefined;
                                    }
                                }}
                            >
                                {(field) => (
                                    <div className="flex flex-col gap-3">
                                        <Label htmlFor="profile-officeEmail">E-mail do escritório</Label>
                                        <Input
                                            id="profile-officeEmail"
                                            type="email"
                                            placeholder="contato@escritorio.com"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                        {field.state.meta.errors.length > 0 && (
                                            <p className="text-destructive text-xs">
                                                {field.state.meta.errors[0]?.toString()}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </form.Field>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Telefone */}
                                <form.Field name="phone">
                                    {(field) => (
                                        <div className="flex flex-col gap-3">
                                            <Label htmlFor="profile-phone">Telefone</Label>
                                            <Input
                                                id="profile-phone"
                                                placeholder="(11) 99999-0000"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </form.Field>

                                {/* Data de nascimento */}
                                <form.Field name="birthdate">
                                    {(field) => (
                                        <div className="flex flex-col gap-3">
                                            <Label htmlFor="profile-birthdate">Data de nascimento</Label>
                                            <Input
                                                id="profile-birthdate"
                                                type="date"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </form.Field>
                            </div>

                            {/* Registro CAU */}
                            <form.Field name="cauRegister">
                                {(field) => (
                                    <div className="flex flex-col gap-3">
                                        <Label htmlFor="profile-cauRegister">Registro CAU</Label>
                                        <Input
                                            id="profile-cauRegister"
                                            placeholder="Ex: A123456-0"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            </form.Field>

                            {/* Endereço do escritório */}
                            <form.Field name="officeAddress">
                                {(field) => (
                                    <div className="flex flex-col gap-3">
                                        <Label htmlFor="profile-officeAddress">Endereço do escritório</Label>
                                        <Input
                                            id="profile-officeAddress"
                                            placeholder="Rua das Flores, 123, São Paulo - SP"
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            </form.Field>

                            {/* Observação */}
                            <form.Field name="observation">
                                {(field) => (
                                    <div className="flex flex-col gap-3">
                                        <Label htmlFor="profile-observation">Observação</Label>
                                        <Textarea
                                            id="profile-observation"
                                            placeholder="Observações adicionais..."
                                            value={field.state.value}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            </form.Field>
                        </>
                    )}
                </form>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>

                    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                form="profile-form"
                                disabled={!canSubmit}
                                loading={isSubmitting}
                            >
                                Salvar alterações
                            </Button>
                        )}
                    </form.Subscribe>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
