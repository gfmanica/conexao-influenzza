import { CrownIcon } from 'lucide-react';

import { PhotoAvatar } from '@/components/photo-upload/photo-avatar';
import { cn } from '@/lib/utils';
import type { ArchitectRanking } from '@/routes/(app)/dashboard/-types';

const BAR_CONFIG = {
    1: {
        barClass: 'bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300',
        ringClass: 'ring-2 ring-amber-400/90 ring-offset-2 ring-offset-background',
        ptsClass: 'text-amber-600 dark:text-amber-400',
        rankClass: 'text-white/90',
        avatarSize: 'size-18',
        barWidth: 240,
        maxBarH: 480,
        showCrown: true,
        showShine: true
    },
    2: {
        barClass: 'bg-gradient-to-t from-zinc-500 via-zinc-400 to-zinc-300',
        ringClass: 'ring-2 ring-zinc-400/70 ring-offset-2 ring-offset-background',
        ptsClass: 'text-zinc-500 dark:text-zinc-400',
        rankClass: 'text-white/90',
        avatarSize: 'size-14',
        barWidth: 192,
        maxBarH: 480,
        showCrown: false,
        showShine: false
    },
    3: {
        barClass: 'bg-gradient-to-t from-amber-800 via-amber-700 to-amber-500',
        ringClass: 'ring-2 ring-amber-700/70 ring-offset-2 ring-offset-background',
        ptsClass: 'text-amber-700 dark:text-amber-600',
        rankClass: 'text-white/90',
        avatarSize: 'size-14',
        barWidth: 192,
        maxBarH: 480,
        showCrown: false,
        showShine: false
    }
} as const;

type PodiumBarProps = {
    rank: 1 | 2 | 3;
    entry: ArchitectRanking[number];
    maxPoints: number;
    animDelay: number;
};

export function PodiumBar({ rank, entry, maxPoints, animDelay }: PodiumBarProps) {
    const cfg = BAR_CONFIG[rank];
    const ratio = entry.totalPoints / maxPoints;
    const barH = Math.round(cfg.maxBarH * ratio);

    return (
        <div
            className="flex flex-col items-center gap-3"
            style={{ flexBasis: cfg.barWidth, flexShrink: 0, flexGrow: 0 }}
        >
            <div className="flex flex-col items-center gap-2 text-center">
                {cfg.showCrown && (
                    <div className="crown-glow">
                        <CrownIcon className="size-7 fill-amber-400 text-amber-400" />
                    </div>
                )}

                <PhotoAvatar photoUrl={entry.photoUrl || ''} name={entry.name} size="lg" />

                <div>
                    <p
                        className={cn(
                            'leading-tight font-semibold',
                            rank === 1 ? 'text-sm' : 'text-xs'
                        )}
                    >
                        {entry.name.split(' ').slice(0, 2).join(' ')}
                    </p>
                    <p
                        className={cn(
                            'font-heading font-bold tabular-nums',
                            rank === 1 ? 'text-lg' : 'text-sm',
                            cfg.ptsClass
                        )}
                    >
                        {entry.totalPoints.toLocaleString('pt-BR')}
                        <span className="ml-1 text-xs font-normal opacity-60">pts</span>
                    </p>
                </div>
            </div>

            <div
                className={cn(
                    'podium-bar relative w-full overflow-hidden rounded-t-2xl',
                    cfg.barClass
                )}
                style={
                    {
                        height: barH,
                        '--anim-delay': `${animDelay}ms`
                    } as React.CSSProperties
                }
            >
                {cfg.showShine && <div className="bar-shine absolute inset-0" />}

                <span
                    className={cn(
                        'font-heading absolute top-4 right-0 left-0 text-center text-5xl font-black drop-shadow-sm',
                        cfg.rankClass
                    )}
                >
                    {rank}
                </span>
            </div>
        </div>
    );
}
