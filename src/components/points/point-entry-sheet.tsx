import * as React from 'react';

import { useForm } from '@tanstack/react-form';

import { type Architect } from '@/components/architects/architect-sheet';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { createPointEntrySchema } from '@/lib/schemas/point-entry';

import { type PointEntry, type PointEntryFormData } from './types';

type PointEntrySheetProps = {
    entry?: PointEntry;
    trigger?: React.ReactNode;
    architects: Architect[];
    onSubmit: (data: PointEntryFormData) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
};

function today() {
    return new Date().toISOString().split('T')[0];
}

export function PointEntrySheet({
    entry,
    trigger,
    architects,
    onSubmit,
    open: openProp,
    onOpenChange
}: PointEntrySheetProps) {
    const isEditing = !!entry;
    const isControlled = openProp !== undefined;
    const isMobile = useIsMobile();
    const [internalOpen, setInternalOpen] = React.useState(false);
    const open = isControlled ? openProp : internalOpen;
    const setOpen = isControlled ? (onOpenChange ?? setInternalOpen) : setInternalOpen;

    const form = useForm({
        defaultValues: {
            architect_id: entry?.architect_id ?? '',
            point_type: entry?.point_type ?? '',
            amount: entry?.amount ?? ('' as unknown as number),
            entry_date: entry?.entry_date ?? today()
        },
        onSubmit: ({ value }) => {
            onSubmit({
                architect_id: value.architect_id,
                point_type: value.point_type.trim(),
                amount: Number(value.amount),
                entry_date: value.entry_date
            });
            setOpen(false);
        },
        validators: {
            onSubmit: ({ value }) => {
                const result = createPointEntrySchema.safeParse({
                    ...value,
                    amount: Number(value.amount)
                });
                if (!result.success) {
                    return result.error.issues[0]?.message ?? 'Formulário inválido';
                }
                return undefined;
            }
        }
    });

    // Reset form when sheet opens
    React.useEffect(() => {
        if (open) {
            form.reset({
                architect_id: entry?.architect_id ?? '',
                point_type: entry?.point_type ?? '',
                amount: entry?.amount ?? ('' as unknown as number),
                entry_date: entry?.entry_date ?? today()
            });
        }
    }, [open]);

    return (
        <Drawer direction={isMobile ? 'bottom' : 'right'} open={open} onOpenChange={setOpen}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
            <DrawerContent className="flex flex-col sm:max-w-lg">
                <DrawerHeader>
                    <DrawerTitle>
                        {isEditing ? 'Editar lançamento' : 'Novo lançamento'}
                    </DrawerTitle>
                    <DrawerDescription>
                        {isEditing
                            ? 'Edite os dados do lançamento de pontos.'
                            : 'Registre um novo lançamento de pontos para um arquiteto parceiro.'}
                    </DrawerDescription>
                </DrawerHeader>

                <form
                    id="point-entry-form"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                    className="flex flex-col gap-5 overflow-y-auto px-6 py-2"
                >
                    {/* Arquiteto */}
                    <form.Field
                        name="architect_id"
                        validators={{
                            onSubmit: ({ value }) =>
                                !value ? 'Arquiteto é obrigatório' : undefined
                        }}
                    >
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="architect">
                                    Arquiteto{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Combobox
                                    id="architect"
                                    value={field.state.value}
                                    onChange={(val) => field.handleChange(val)}
                                    options={architects.map((a) => ({
                                        value: a.id,
                                        label: a.name
                                    }))}
                                    placeholder="Selecionar arquiteto..."
                                    searchPlaceholder="Buscar arquiteto..."
                                    emptyText="Nenhum arquiteto encontrado."
                                />
                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-destructive text-xs">
                                        {field.state.meta.errors[0]?.toString()}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <Separator />

                    {/* Tipo de ponto */}
                    <form.Field
                        name="point_type"
                        validators={{
                            onBlur: ({ value }) =>
                                !value.trim()
                                    ? 'Tipo de ponto é obrigatório'
                                    : undefined
                        }}
                    >
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="point_type">
                                    Tipo de ponto{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="point_type"
                                    placeholder="Ex: Venda de Rack"
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
                        {/* Quantidade */}
                        <form.Field
                            name="amount"
                            validators={{
                                onBlur: ({ value }) => {
                                    const n = Number(value);
                                    if (!value || isNaN(n) || n <= 0)
                                        return 'Quantidade deve ser maior que zero';
                                    return undefined;
                                }
                            }}
                        >
                            {(field) => (
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="amount">
                                        Quantidade{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min={1}
                                        placeholder="Ex: 500"
                                        value={String(field.state.value ?? '')}
                                        onBlur={field.handleBlur}
                                        onChange={(e) =>
                                            field.handleChange(
                                                e.target.valueAsNumber as unknown as number
                                            )
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

                        {/* Data */}
                        <form.Field
                            name="entry_date"
                            validators={{
                                onSubmit: ({ value }) =>
                                    !value ? 'Data é obrigatória' : undefined
                            }}
                        >
                            {(field) => (
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="entry_date">
                                        Data{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <DatePicker
                                        id="entry_date"
                                        value={field.state.value}
                                        onChange={(val) =>
                                            field.handleChange(val)
                                        }
                                        placeholder="Selecionar data..."
                                    />
                                    {field.state.meta.errors.length > 0 && (
                                        <p className="text-destructive text-xs">
                                            {field.state.meta.errors[0]?.toString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>
                    </div>
                </form>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>
                    <form.Subscribe selector={(s) => s.canSubmit}>
                        {(canSubmit) => (
                            <Button
                                type="submit"
                                form="point-entry-form"
                                disabled={!canSubmit}
                            >
                                {isEditing
                                    ? 'Salvar alterações'
                                    : 'Registrar pontos'}
                            </Button>
                        )}
                    </form.Subscribe>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
