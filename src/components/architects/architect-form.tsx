import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useFormArchitect } from '@/hooks/architects/use-form-architect';
import { useIsMobile } from '@/hooks/use-mobile';
import { type Architect } from '@/types/architect';

import { ArchitectAvatar } from './architect-avatar';

export type { Architect };

type ArchitectForm = {
    architect?: Architect;
    trigger?: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function ArchitectForm({ architect, trigger, open, onOpenChange }: ArchitectForm) {
    const isEditing = !!architect;
    const isMobile = useIsMobile();

    const [photoPreview, setPhotoPreview] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const photoFileRef = useRef<File | null>(null);

    const form = useFormArchitect({ photoFileRef });

    useEffect(() => {
        form.reset({
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
        });

        // Limpa o estado de foto ao abrir/fechar
        photoFileRef.current = null;
        setPhotoPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }, [open, architect]);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) return;

        photoFileRef.current = file;
        setPhotoPreview(URL.createObjectURL(file));
    }

    return (
        <Drawer direction={isMobile ? 'bottom' : 'right'} open={open} onOpenChange={onOpenChange}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{isEditing ? 'Editar Arquiteto' : 'Novo Arquiteto'}</DrawerTitle>

                    <DrawerDescription>
                        {isEditing
                            ? 'Edite os dados do arquiteto parceiro.'
                            : 'Cadastre um novo arquiteto parceiro. O acesso ao portal será liberado no primeiro login via OTP.'}
                    </DrawerDescription>
                </DrawerHeader>

                <form
                    className="flex flex-col gap-5 overflow-y-auto px-4 py-2"
                    id="architect-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    {/* Photo */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="photo">Foto</Label>

                        <div className="flex items-center gap-4">
                            <ArchitectAvatar
                                photoUrl={photoPreview || form.state.values.photoUrl}
                                name={form.state.values.name}
                            />

                            <div className="flex flex-1 flex-col gap-1">
                                <Input
                                    ref={fileInputRef}
                                    id="photo"
                                    name="photo"
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    className="cursor-pointer"
                                    onChange={handlePhotoChange}
                                />

                                {/* {uploadError && (
                                    <p className="text-destructive text-xs">{uploadError}</p>
                                )} */}
                            </div>
                        </div>
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
                                <Label htmlFor="name">
                                    Nome completo <span className="text-destructive">*</span>
                                </Label>

                                <Input
                                    id="name"
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

                    {/* E-mail */}
                    <form.Field
                        name="email"
                        validators={{
                            onBlur: ({ value }) => {
                                if (!isEditing && !value.trim()) return 'E-mail é obrigatório';
                                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                                    return 'E-mail inválido';
                                return undefined;
                            }
                        }}
                    >
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="email">
                                    E-mail <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="arquiteto@escritorio.com"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    disabled={isEditing}
                                />
                                {isEditing && (
                                    <p className="text-muted-foreground text-xs">
                                        E-mail não pode ser alterado após o cadastro.
                                    </p>
                                )}
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-destructive text-xs">
                                        {field.state.meta.errors[0]?.toString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

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
                                <Label htmlFor="officeEmail">E-mail do escritório</Label>
                                <Input
                                    id="officeEmail"
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
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
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
                                    <Label htmlFor="birthdate">Data de nascimento</Label>
                                    <Input
                                        id="birthdate"
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
                                <Label htmlFor="cauRegister">Registro CAU</Label>
                                <Input
                                    id="cauRegister"
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
                                <Label htmlFor="officeAddress">Endereço do escritório</Label>
                                <Input
                                    id="officeAddress"
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
                                <Label htmlFor="observation">Observação</Label>
                                <Textarea
                                    id="observation"
                                    placeholder="Observações adicionais sobre o arquiteto..."
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}
                    </form.Field>
                </form>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>

                    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                form="architect-form"
                                disabled={!canSubmit}
                                loading={isSubmitting}
                            >
                                {isEditing ? 'Salvar alterações' : 'Cadastrar arquiteto'}
                            </Button>
                        )}
                    </form.Subscribe>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
