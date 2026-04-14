import * as React from 'react';

import { type Architect } from '@/components/architects/architect-sheet';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/date-picker';
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

import { type PointEntry, type PointEntryFormData } from './types';

type PointEntrySheetProps = {
    entry?: PointEntry;
    trigger: React.ReactNode;
    architects: Architect[];
    onSubmit: (data: PointEntryFormData) => void;
};

function today() {
    return new Date().toISOString().split('T')[0];
}

export function PointEntrySheet({
    entry,
    trigger,
    architects,
    onSubmit
}: PointEntrySheetProps) {
    const isEditing = !!entry;
    const [open, setOpen] = React.useState(false);
    const [architectId, setArchitectId] = React.useState(
        entry?.architect_id ?? ''
    );
    const [pointTypeName, setPointTypeName] = React.useState(
        entry?.point_type_name ?? ''
    );
    const [amount, setAmount] = React.useState(entry?.amount?.toString() ?? '');
    const [entryDate, setEntryDate] = React.useState(
        entry?.entry_date ?? today()
    );

    React.useEffect(() => {
        if (open) {
            setArchitectId(entry?.architect_id ?? '');
            setPointTypeName(entry?.point_type_name ?? '');
            setAmount(entry?.amount?.toString() ?? '');
            setEntryDate(entry?.entry_date ?? today());
        }
    }, [open, entry]);

    const canSubmit =
        !!architectId && !!pointTypeName.trim() && !!amount && !!entryDate;

    function handleSubmit() {
        if (!canSubmit) return;
        onSubmit({
            architect_id: architectId,
            point_type_name: pointTypeName.trim(),
            amount: Number(amount),
            entry_date: entryDate
        });
        setOpen(false);
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={trigger as React.ReactElement} />
            <SheetContent className="flex flex-col overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle>
                        {isEditing ? 'Editar lançamento' : 'Novo lançamento'}
                    </SheetTitle>
                    <SheetDescription>
                        {isEditing
                            ? 'Edite os dados do lançamento de pontos.'
                            : 'Registre um novo lançamento de pontos para um arquiteto parceiro.'}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-5 overflow-y-auto px-6 py-2">
                    {/* Arquiteto */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="architect">
                            Arquiteto{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Combobox
                            id="architect"
                            value={architectId}
                            onChange={setArchitectId}
                            options={architects.map((a) => ({
                                value: a.id,
                                label: a.name
                            }))}
                            placeholder="Selecionar arquiteto..."
                            searchPlaceholder="Buscar arquiteto..."
                            emptyText="Nenhum arquiteto encontrado."
                        />
                    </div>

                    <Separator />

                    {/* Tipo de ponto */}
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="point_type_name">
                            Tipo de ponto{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="point_type_name"
                            placeholder="Ex: Venda de Rack"
                            value={pointTypeName}
                            onChange={(e) => setPointTypeName(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Quantidade */}
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="amount">
                                Quantidade{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                min={1}
                                placeholder="Ex: 500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        {/* Data */}
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="entry_date">
                                Data <span className="text-destructive">*</span>
                            </Label>
                            <DatePicker
                                id="entry_date"
                                value={entryDate}
                                onChange={setEntryDate}
                                placeholder="Selecionar data..."
                            />
                        </div>
                    </div>
                </div>

                <SheetFooter>
                    <SheetClose render={<Button variant="outline" />}>
                        Cancelar
                    </SheetClose>
                    <Button disabled={!canSubmit} onClick={handleSubmit}>
                        {isEditing ? 'Salvar alterações' : 'Registrar pontos'}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
