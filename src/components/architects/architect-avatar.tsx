import { UserIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function ArchitectAvatar({ photoUrl, name }: { photoUrl?: string; name: string }) {
    const initials = name
        ?.split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <Avatar size="lg">
            <AvatarImage src={photoUrl} />

            <AvatarFallback>
                {initials} {!initials && <UserIcon className="size-4" />}
            </AvatarFallback>
        </Avatar>
    );
}
