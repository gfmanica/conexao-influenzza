import { type ReactNode } from 'react';

import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';

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
import { architectsQueryOptions } from '@/hooks/use-architects';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCreatePointEntry, useUpdatePointEntry } from '@/hooks/use-point-entries';
import {
    createPointEntrySchema,
    updatePointEntrySchema,
    type PointEntry,
    type PointEntryArchitect
} from '@/types/point-entry';

export type { PointEntry };

type PointEntryFormProps = {
    entry?: PointEntry;
    trigger?: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

function today() {
    return new Date().toISOString().split('T')[0];
}

export function PointEntryForm({ entry, trigger, open, onOpenChange }: PointEntryFormProps) {
    const isEditing = !!entry;
    const isMobile = useIsMobile();

    const { data: architectsData } = useQuery(architectsQueryOptions());
    const architects = architectsData?.data ?? [];

    const createMutation = useCreatePointEntry();
    const updateMutation = useUpdatePointEntry();

    const form = useForm({
        defaultValues: {
            architect: (entry?.architect ?? null) as PointEntryArchitect | null,
            pointType: entry?.pointType ?? '',
            amount: entry?.amount ?? ('' as unknown as number),
            entryDate:
                entry?.entryDate instanceof Date
                    ? entry.entryDate.toISOString().split('T')[0]
                    : (entry?.entryDate ?? today())
        },
        onSubmit: async ({ value }) => {
            const payload = {
                userId: value.architect!.id,
                pointType: value.pointType,
                amount: Number(value.amount),
                entryDate: value.entryDate
            };

            if (isEditing) {
                await updateMutation.mutateAsync({ data: { ...payload, id: entry.id } });
            } else {
                await createMutation.mutateAsync({ data: payload });
            }

            onOpenChange(false);
        },
        validators: {
            onSubmit: ({ value }) => {
                const parsed = {
                    userId: value.architect?.id,
                    pointType: value.pointType,
                    amount: Number(value.amount),
                    entryDate: value.entryDate
                };

                const result = isEditing
                    ? updatePointEntrySchema.safeParse({ ...parsed, id: entry.id })
                    : createPointEntrySchema.safeParse(parsed);

                if (!result.success) {
                    return result.error.issues[0]?.message ?? 'Formulário inválido';
                }

                return undefined;
            }
        }
    });

    return (
        <Drawer direction={isMobile ? 'bottom' : 'right'} open={open} onOpenChange={onOpenChange}>
            {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}

            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{isEditing ? 'Editar lançamento' : 'Novo lançamento'}</DrawerTitle>

                    <DrawerDescription>
                        {isEditing
                            ? 'Edite os dados do lançamento de pontos.'
                            : 'Registre um novo lançamento de pontos para um arquiteto parceiro.'}
                    </DrawerDescription>
                </DrawerHeader>

                <form
                    id="point-entry-form"
                    className="flex flex-col gap-5 overflow-y-auto px-4 py-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    {/* Arquiteto */}
                    <form.Field name="architect">
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="architect">
                                    Arquiteto <span className="text-destructive">*</span>
                                </Label>

                                <Combobox
                                    value={field.state.value?.id ?? ''}
                                    onChange={(option) => field.handleChange(option?.data ?? null)}
                                    options={architects.map((a) => ({
                                        value: a.id,
                                        label: a.name,
                                        data: {
                                            id: a.id,
                                            name: a.name,
                                            photoUrl: a.photoUrl
                                        }
                                    }))}
                                    placeholder="Selecionar arquiteto..."
                                    searchPlaceholder="Buscar arquiteto..."
                                    emptyText="Nenhum arquiteto encontrado."
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-destructive text-xs">
                                        {field.state.meta.errors[0]}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <Separator />

                    {/* Tipo de ponto */}
                    <form.Field name="pointType">
                        {(field) => (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="pointType">
                                    Tipo de ponto <span className="text-destructive">*</span>
                                </Label>

                                <Input
                                    id="pointType"
                                    placeholder="Ex: Venda de Rack"
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                />

                                {field.state.meta.errors.length > 0 && (
                                    <p className="text-destructive text-xs">
                                        {field.state.meta.errors[0]}
                                    </p>
                                )}
                            </div>
                        )}
                    </form.Field>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Quantidade */}
                        <form.Field name="amount">
                            {(field) => (
                                <div className="flex flex-col gap-3">
                                    <Label htmlFor="amount">
                                        Quantidade <span className="text-destructive">*</span>
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
                                            {field.state.meta.errors[0]}
                                        </p>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        {/* Data */}
                        <form.Field name="entryDate">
                            {(field) => {
                                console.log(field.state.meta);
                                return (
                                    <div className="flex flex-col gap-3">
                                        <Label htmlFor="entryDate">
                                            Data <span className="text-destructive">*</span>
                                        </Label>

                                        <DatePicker
                                            value={field.state.value}
                                            onChange={(val) => field.handleChange(val)}
                                            placeholder="Selecionar data..."
                                        />

                                        {field.state.meta.errors.length > 0 && (
                                            <p className="text-destructive text-xs">
                                                {field.state.meta.errors[0]}
                                            </p>
                                        )}
                                    </div>
                                );
                            }}
                        </form.Field>
                    </div>
                </form>

                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DrawerClose>

                    <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
                        {([canSubmit, isSubmitting]) => (
                            <Button
                                type="submit"
                                form="point-entry-form"
                                disabled={!canSubmit}
                                loading={isSubmitting}
                            >
                                {isEditing ? 'Salvar alterações' : 'Registrar pontos'}
                            </Button>
                        )}
                    </form.Subscribe>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
