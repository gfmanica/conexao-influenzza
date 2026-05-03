import type { ComponentProps } from 'react';

import { Combobox } from '@/components/ui/combobox';
import { useComboboxQuery } from '@/hooks/use-combobox-query';
import { architectsQueryOptions } from '@/routes/(app)/architects/-hooks/use-query-architects';
import type { Architect } from '@/routes/(app)/architects/-types';

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
