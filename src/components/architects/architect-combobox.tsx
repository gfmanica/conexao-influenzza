import type { ComponentProps } from 'react';

import { architectsQueryOptions } from '@/hooks/architects/use-architects';
import { useComboboxQuery } from '@/hooks/use-combobox-query';

import { Combobox } from '../ui/combobox';
import type { Architect } from './architect-form';

export function ArchitectCombobox({
    value,
    onChange,
    ...props
}: {
    value: Architect | null;
    onChange: (architect: Architect | null) => void;
    disabled?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    className?: ComponentProps<typeof Combobox>['className'];
}) {
    const architectsQuery = useComboboxQuery({
        queryOptions: architectsQueryOptions,
        displayField: 'name'
    });

    return (
        <Combobox<Architect>
            {...props}
            value={value}
            onChange={onChange}
            query={architectsQuery}
            keyField="id"
            displayField="name"
        />
    );
}
