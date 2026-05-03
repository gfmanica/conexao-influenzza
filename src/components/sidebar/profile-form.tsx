import { useEffect } from 'react';

import { PhotoUpload } from '@/components/photo-upload/photo-upload';
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
import { usePhotoUpload } from '@/hooks/use-photo-upload';

import { DatePicker } from '../ui/date-picker';
import { type ProfileUser, useFormProfile } from './use-form-profile';

type ProfileFormProps = {
    user: ProfileUser;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ProfileForm({ user, open, onOpenChange }: ProfileFormProps) {
    const isMobile = useIsMobile();
    const isArchitect = user.role === 'architect';

    const photoUpload = usePhotoUpload({
        onUrlChange: (url) => form.setFieldValue('photoUrl', url)
    });

    const form = useFormProfile({
        user,
        photoFileRef: photoUpload.photoFileRef,
        onSuccess: () => onOpenChange(false)
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

        photoUpload.resetInitialUrl(user.photoUrl ?? '');
    }, [open, user.id]);

    return (
        <Drawer direction={isMobile ? 'bottom' : 'right'} open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Editar Perfil</DrawerTitle>

                    <DrawerDescription>Atualize seus dados pessoais.</DrawerDescription>
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

                        <form.Subscribe
                            selector={(s) => [s.values.photoUrl, s.values.name] as const}
                        >
                            {([photoUrl, name]) => {
                                const isDirty =
                                    !!photoUpload.photoFileRef.current ||
                                    photoUrl !== (user.photoUrl ?? '');

                                return (
                                    <PhotoUpload
                                        name={name}
                                        photoUrl={photoUrl}
                                        photoPreview={photoUpload.photoPreview}
                                        fileInputRef={photoUpload.fileInputRef}
                                        inputId="profile-photo"
                                        onFileChange={photoUpload.handleFileChange}
                                        onDelete={photoUpload.handleDelete}
                                        onRestore={photoUpload.handleRestore}
                                        canRestore={isDirty}
                                    />
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

                    <div className="flex flex-col gap-3">
                        <Label htmlFor="profile-email">E-mail</Label>
                        <Input id="profile-email" type="email" value={user.email} disabled />
                        <p className="text-muted-foreground text-xs">
                            E-mail não pode ser alterado.
                        </p>
                    </div>

                    {isArchitect && (
                        <>
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
                                        <Label htmlFor="profile-officeEmail">
                                            E-mail do escritório
                                        </Label>
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

                                <form.Field name="birthdate">
                                    {(field) => (
                                        <div className="flex flex-col gap-3">
                                            <Label htmlFor="profile-birthdate">
                                                Data de nascimento
                                            </Label>

                                            <DatePicker
                                                id="profile-birthdate"
                                                value={field.state.value}
                                                onChange={(val) => field.handleChange(val)}
                                                placeholder="Selecionar data..."
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
                                        <Label htmlFor="profile-officeAddress">
                                            Endereço do escritório
                                        </Label>
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
                    <form.Subscribe selector={(s) => s.errors as unknown as string[]}>
                        {(errors) =>
                            errors.length > 0 && (
                                <p className="text-destructive text-xs">{errors[0]}</p>
                            )
                        }
                    </form.Subscribe>

                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>

                    <form.Subscribe selector={(s) => s.isSubmitting}>
                        {(isSubmitting) => (
                            <Button
                                type="submit"
                                form="profile-form"
                                disabled={isSubmitting}
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
