import * as React from 'react';

import { ChevronsUpDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
    value: string;
    label: string;
};

type ComboboxProps = {
    options: ComboboxOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: string;
    id?: string;
};

export function Combobox({
    options,
    value,
    onChange,
    placeholder = 'Selecionar...',
    searchPlaceholder = 'Buscar...',
    emptyText = 'Nenhum resultado.',
    className,
    id
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const selected = options.find((o) => o.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                render={
                    <Button
                        id={id}
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            'bg-input/50 h-9 w-full justify-between border-transparent font-normal shadow-none',
                            className
                        )}
                    />
                }
            >
                {selected ? (
                    selected.label
                ) : (
                    <span className="text-muted-foreground">{placeholder}</span>
                )}
                <ChevronsUpDownIcon className="text-muted-foreground ml-2 size-4 shrink-0" />
            </PopoverTrigger>
            <PopoverContent
                className="w-(--anchor-width) p-0"
                align="start"
                sideOffset={4}
            >
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyText}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    data-checked={value === option.value}
                                    onSelect={() => {
                                        onChange(
                                            option.value === value
                                                ? ''
                                                : option.value
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
