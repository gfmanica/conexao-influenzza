import * as React from 'react';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DatePickerProps = {
    value: string; // YYYY-MM-DD
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    id?: string;
};

export function DatePicker({
    value,
    onChange,
    placeholder = 'Selecionar data...',
    className,
    id
}: DatePickerProps) {
    const [open, setOpen] = React.useState(false);
    const date = value ? parseISO(value) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        variant="outline"
                        className={cn(
                            'bg-input/50 h-9 w-full justify-start gap-2 border-transparent font-normal shadow-none',
                            !value && 'text-muted-foreground',
                            className
                        )}
                    />
                }
            >
                <CalendarIcon className="size-4 shrink-0" />
                {date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => {
                        onChange(d ? format(d, 'yyyy-MM-dd') : '');

                        setOpen(false);
                    }}
                    locale={ptBR}
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    );
}
