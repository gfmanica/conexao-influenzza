import type { ComponentProps } from 'react';

import { UserIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function PhotoAvatar({
    photoUrl,
    name,
    size,
    className
}: {
    photoUrl?: string | null;
    name: string;
    size?: ComponentProps<typeof Avatar>['size'];
    className?: ComponentProps<typeof Avatar>['className'];
}) {
    const initials = name
        ?.split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <Avatar className={className} size={size}>
            <AvatarImage src={photoUrl ?? undefined} />

            <AvatarFallback>{initials || <UserIcon className="size-4" />}</AvatarFallback>
        </Avatar>
    );
}
