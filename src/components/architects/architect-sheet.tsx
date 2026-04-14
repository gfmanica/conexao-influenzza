import * as React from 'react';

import { useForm } from '@tanstack/react-form';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from '@/components/ui/sheet';
import {
    createArchitectSchema,
    updateArchitectSchema
} from '@/lib/schemas/architect';

export type Architect = {
    id: string;
    name: string;
    email: string;
    office_email?: string | null;
    phone?: string | null;
    office_address?: string | null;
    birthdate?: string | null;
    cau_register?: string | null;
    observation?: string | null;
    photo_url?: string | null;
    linked: boolean;
    total_points: number;
    created_at: string;
    updated_at: string;
};

type ArchitectFormData = {
    name: string;
    email: string;
    office_email?: string;
    phone?: string;
    office_address?: string;
    birthdate?: string;
    cau_register?: string;
    observation?: string;
    photo?: File;
};

type ArchitectSheetProps = {
    architect?: Architect;
    trigger: React.ReactNode;
    onSubmit?: (data: ArchitectFormData) => void;
};

export function ArchitectSheet({
    architect,
    trigger,
    onSubmit
}: ArchitectSheetProps) {
    const isEditing = !!architect;
    const [photoPreview, setPhotoPreview] = React.useState<string | undefined>(
        architect?.photo_url ?? undefined
    );
    const [photoFile, setPhotoFile] = React.useState<File | undefined>();

    const schema = isEditing ? updateArchitectSchema : createArchitectSchema;

    const form = useForm({
        defaultValues: {
            name: architect?.name ?? '',
            email: architect?.email ?? '',
            office_email: architect?.office_email ?? '',
            phone: architect?.phone ?? '',
            office_address: architect?.office_address ?? '',
            birthdate: architect?.birthdate ?? '',
            cau_register: architect?.cau_register ?? '',
            observation: architect?.observation ?? ''
        },
        onSubmit: ({ value }) => {
            onSubmit?.({
                ...value,
                office_email: value.office_email || undefined,
                phone: value.phone || undefined,
                office_address: value.office_address || undefined,
                birthdate: value.birthdate || undefined,
                cau_register: value.cau_register || undefined,
                observation: value.observation || undefined,
                photo: photoFile
            });
        },
        validators: {
            onSubmit: ({ value }) => {
                const result = schema.safeParse(value);
                if (!result.success) {
                    return result.error.issues[0]?.message ?? 'Formulário inválido';
                }
                return undefined;
            }
        }
    });

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
            setPhotoFile(file);
        }
    }

    const initials = (form.state.values.name || architect?.name)
        ?.split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <Sheet>
            <SheetTrigger render={trigger as React.ReactElement} />
            <SheetContent className="flex flex-col overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>
                        {isEditing ? 'Editar Arquiteto' : 'Novo Arquiteto'}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? 'Edite os dados do arquiteto parceiro.'
                            : 'Cadastre um novo arquiteto parceiro. O acesso ao portal será liberado no primeiro login via OTP.'}
                    </SheetDescription>
                </SheetHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="flex flex-col gap-5 overflow-y-auto px-6 py-2"
                    id="architect-form"
                >
                    {/* Photo */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="photo">Foto</Label>
                        <div className="flex items-center gap-4">
                            <Avatar size="lg">
                                <AvatarImage src={photoPreview} />
                                <AvatarFallback>
                                    {initials ?? 'AR'}
                                </AvatarFallback>
                            </Avatar>
                            <Input
                                id="photo"
                                name="photo"
                                type="file"
                                accept="image/*"
                                className="cursor-pointer"
                                onChange={handlePhotoChange}
                            />
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
                                    Nome completo{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Ana Carolina Mendes"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
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
                                if (!isEditing && !value.trim())
                                    return 'E-mail é obrigatório';
                                if (
                                    value &&
                                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                                )
                                    return 'E-mail inválido';
                                return undefined;
                            }
                        }}
                    >
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="email">
                                    E-mail{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="arquiteto@escritorio.com"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    disabled={isEditing}
                                />
                                {isEditing && (
                                    <p className="text-muted-foreground text-xs">
                                        E-mail não pode ser alterado após o
                                        cadastro.
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
                        name="office_email"
                        validators={{
                            onBlur: ({ value }) => {
                                if (
                                    value &&
                                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                                )
                                    return 'E-mail inválido';
                                return undefined;
                            }
                        }}
                    >
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="office_email">
                                    E-mail do escritório
                                </Label>
                                <Input
                                    id="office_email"
                                    type="email"
                                    placeholder="contato@escritorio.com"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
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
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                    />
                                </div>
                            )}
                        </form.Field>

                        {/* Data de nascimento */}
                        <form.Field name="birthdate">
                            {(field) => (
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="birthdate">
                                        Data de nascimento
                                    </Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(e.target.value)
                                        }
                                    />
                                </div>
                            )}
                        </form.Field>
                    </div>

                    {/* Registro CAU */}
                    <form.Field name="cau_register">
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="cau_register">
                                    Registro CAU
                                </Label>
                                <Input
                                    id="cau_register"
                                    placeholder="Ex: A123456-0"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                />
                            </div>
                        )}
                    </form.Field>

                    {/* Endereço do escritório */}
                    <form.Field name="office_address">
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="office_address">
                                    Endereço do escritório
                                </Label>
                                <Input
                                    id="office_address"
                                    placeholder="Rua das Flores, 123, São Paulo - SP"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
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
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                />
                            </div>
                        )}
                    </form.Field>
                </form>

                <SheetFooter>
                    <SheetClose render={<Button variant="outline" />}>
                        Cancelar
                    </SheetClose>
                    <form.Subscribe selector={(s) => s.canSubmit}>
                        {(canSubmit) => (
                            <Button
                                type="submit"
                                form="architect-form"
                                disabled={!canSubmit}
                            >
                                {isEditing
                                    ? 'Salvar alterações'
                                    : 'Cadastrar arquiteto'}
                            </Button>
                        )}
                    </form.Subscribe>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
