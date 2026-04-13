import * as React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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

export type Architect = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    office_address?: string;
    birthdate?: string;
    cau_register?: string;
    photo_url?: string;
    linked: boolean;
    total_points: number;
    created_at: string;
    updated_at: string;
};

type ArchitectFormData = {
    name: string;
    email: string;
    phone?: string;
    office_address?: string;
    birthdate?: string;
    cau_register?: string;
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
    const formId = React.useId();
    const [photoPreview, setPhotoPreview] = React.useState<string | undefined>(
        architect?.photo_url
    );

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        }
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        onSubmit?.({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: (formData.get('phone') as string) || undefined,
            office_address:
                (formData.get('office_address') as string) || undefined,
            birthdate: (formData.get('birthdate') as string) || undefined,
            cau_register: (formData.get('cau_register') as string) || undefined,
            photo: (formData.get('photo') as File) || undefined
        });
    }

    const initials = architect?.name
        .split(' ')
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
                    id={formId}
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 overflow-y-auto px-6 py-2"
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
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="name">
                            Nome completo{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: Ana Carolina Mendes"
                            defaultValue={architect?.name}
                            required
                        />
                    </div>

                    {/* E-mail */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="email">
                            E-mail <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="arquiteto@escritorio.com"
                            defaultValue={architect?.email}
                            required
                            disabled={isEditing}
                        />
                        {isEditing && (
                            <p className="text-muted-foreground text-xs">
                                E-mail não pode ser alterado após o cadastro.
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Telefone */}
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="(11) 99999-0000"
                                defaultValue={architect?.phone}
                            />
                        </div>

                        {/* Data de nascimento */}
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="birthdate">
                                Data de nascimento
                            </Label>
                            <Input
                                id="birthdate"
                                name="birthdate"
                                type="date"
                                defaultValue={architect?.birthdate}
                            />
                        </div>
                    </div>

                    {/* Registro CAU */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="cau_register">Registro CAU</Label>
                        <Input
                            id="cau_register"
                            name="cau_register"
                            placeholder="Ex: A123456-0"
                            defaultValue={architect?.cau_register}
                        />
                    </div>

                    {/* Endereço do escritório */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="office_address">
                            Endereço do escritório
                        </Label>
                        <Input
                            id="office_address"
                            name="office_address"
                            placeholder="Rua das Flores, 123, São Paulo - SP"
                            defaultValue={architect?.office_address}
                        />
                    </div>
                </form>

                <SheetFooter>
                    <SheetClose render={<Button variant="outline" />}>
                        Cancelar
                    </SheetClose>
                    <Button type="submit" form={formId}>
                        {isEditing ? 'Salvar alterações' : 'Cadastrar arquiteto'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
