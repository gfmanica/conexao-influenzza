import { UserIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function ArchitectAvatar({ photoUrl, name }: { photoUrl?: string | null; name: string }) {
    const initials = name
        ?.split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <Avatar size="lg">
            <AvatarImage src={photoUrl ?? undefined} />

            <AvatarFallback>
                {initials} {!initials && <UserIcon className="size-4" />}
            </AvatarFallback>
        </Avatar>
    );
}
