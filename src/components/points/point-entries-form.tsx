import { type ReactNode } from 'react';

import { useForm } from '@tanstack/react-form';

import { Button } from '@/components/ui/button';
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
import { useCreatePointEntry, useUpdatePointEntry } from '@/hooks/points/use-point-entries';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Architect } from '@/types/architect';
import {
    createPointEntrySchema,
    updatePointEntrySchema,
    type PointEntry,
    type PointEntryArchitect
} from '@/types/point-entry';

import { ArchitectCombobox } from '../architects/architect-combobox';

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

                                <ArchitectCombobox
                                    value={field.state.value as Architect | null}
                                    onChange={(architect) => field.handleChange(architect)}
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
