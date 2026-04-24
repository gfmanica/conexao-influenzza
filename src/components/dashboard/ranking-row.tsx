import { StarIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { type RankingEntry } from './types';
import { getInitials } from './utils';

type RankingRowProps = {
    rank: number;
    entry: RankingEntry;
    maxPoints: number;
    delay: number;
};

export function RankingRow({ rank, entry, maxPoints, delay }: RankingRowProps) {
    const pct = Math.max(4, (entry.total_points / maxPoints) * 100);

    return (
        <div
            className="row-appear hover:bg-muted/60 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
            style={{ animationDelay: `${delay}ms` }}
        >
            <span className="font-heading text-muted-foreground w-6 shrink-0 text-right text-sm font-bold tabular-nums">
                {rank}
            </span>

            <Avatar className="size-8 shrink-0">
                <AvatarImage src={entry.photo_url ?? undefined} />
                <AvatarFallback className="text-[10px] font-medium">
                    {getInitials(entry.name)}
                </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-sm font-medium">{entry.name}</span>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                        className="bar-fill h-full rounded-full bg-gradient-to-r from-amber-500/80 to-amber-400/40"
                        style={
                            {
                                '--bar-width': `${pct}%`,
                                animationDelay: `${delay + 150}ms`
                            } as React.CSSProperties
                        }
                    />
                </div>
            </div>

            <div className="text-muted-foreground flex shrink-0 items-center gap-1">
                <StarIcon className="size-3 fill-current text-amber-500/70" />
                <span className="text-sm font-semibold tabular-nums">
                    {entry.total_points.toLocaleString('pt-BR')}
                </span>
            </div>
        </div>
    );
}
