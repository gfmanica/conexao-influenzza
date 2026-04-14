import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { CrownIcon, StarIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { rankingQueryOptions } from '@/hooks/use-ranking';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/_app/dashboard')({
    loader: ({ context }) => {
        context.queryClient.ensureQueryData(rankingQueryOptions);
    },
    component: RouteComponent
});
// ── Types ─────────────────────────────────────────────────────────────────

type RankingEntry = {
    position: number;
    architect_id: string;
    name: string;
    photo_url: string | null;
    total_points: number;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string) {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

// ── Podium Bar ─────────────────────────────────────────────────────────────

const BAR_CONFIG = {
    1: {
        barClass: 'bg-gradient-to-t from-amber-600 via-amber-400 to-amber-300',
        ringClass:
            'ring-2 ring-amber-400/90 ring-offset-2 ring-offset-background',
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
        ringClass:
            'ring-2 ring-zinc-400/70 ring-offset-2 ring-offset-background',
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
        ringClass:
            'ring-2 ring-amber-700/70 ring-offset-2 ring-offset-background',
        ptsClass: 'text-amber-700 dark:text-amber-600',
        rankClass: 'text-white/90',
        avatarSize: 'size-14',
        barWidth: 192,
        maxBarH: 480,
        showCrown: false,
        showShine: false
    }
} as const;

function PodiumBar({
    rank,
    entry,
    maxPoints,
    animDelay
}: {
    rank: 1 | 2 | 3;
    entry: RankingEntry;
    maxPoints: number;
    animDelay: number;
}) {
    const cfg = BAR_CONFIG[rank];
    const ratio = entry.total_points / maxPoints;
    const barH = Math.round(cfg.maxBarH * ratio);

    return (
        <div
            className="flex flex-col items-center gap-3"
            style={{ flexBasis: cfg.barWidth, flexShrink: 0, flexGrow: 0 }}
        >
            {/* Info above bar */}
            <div className="flex flex-col items-center gap-2 text-center">
                {cfg.showCrown && (
                    <div className="crown-glow">
                        <CrownIcon className="size-7 fill-amber-400 text-amber-400" />
                    </div>
                )}

                <Avatar className={cn(cfg.avatarSize, cfg.ringClass)}>
                    <AvatarImage src={entry.photo_url ?? undefined} />
                    <AvatarFallback
                        className={cn(
                            'font-semibold',
                            rank === 1 ? 'text-sm' : 'text-xs'
                        )}
                    >
                        {getInitials(entry.name)}
                    </AvatarFallback>
                </Avatar>

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
                        {entry.total_points.toLocaleString('pt-BR')}
                        <span className="ml-1 text-xs font-normal opacity-60">
                            pts
                        </span>
                    </p>
                </div>
            </div>

            {/* Bar */}
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
                {/* Shine sweep for 1st */}
                {cfg.showShine && (
                    <div className="bar-shine absolute inset-0" />
                )}

                {/* Rank number at top center */}
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

// ── Ranking Row (4–10) ─────────────────────────────────────────────────────

function RankingRow({
    rank,
    entry,
    maxPoints,
    delay
}: {
    rank: number;
    entry: RankingEntry;
    maxPoints: number;
    delay: number;
}) {
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
                <span className="truncate text-sm font-medium">
                    {entry.name}
                </span>
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

// ── Route ──────────────────────────────────────────────────────────────────

function RouteComponent() {
    const { data } = useSuspenseQuery(rankingQueryOptions);
    const { ranking, year: YEAR } = data;

    const top3 = ranking.slice(0, 3);
    const rest = ranking.slice(3);
    const maxPoints = ranking[0]?.total_points ?? 1;

    return (
        <>
            <style>{`
                @keyframes crown-pulse {
                    0%, 100% { filter: drop-shadow(0 0 4px #fbbf24bb); }
                    50%       { filter: drop-shadow(0 0 14px #fbbf24ff) drop-shadow(0 0 24px #f59e0b55); }
                }
                .crown-glow { animation: crown-pulse 2.6s ease-in-out infinite; }

                @keyframes bar-rise {
                    from { transform: scaleY(0); }
                    to   { transform: scaleY(1); }
                }
                .podium-bar {
                    transform-origin: bottom;
                    animation: bar-rise 0.75s cubic-bezier(.22,1,.36,1) var(--anim-delay, 0ms) both;
                }

                @keyframes shine-sweep {
                    0%   { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
                    20%  { opacity: 1; }
                    80%  { opacity: 1; }
                    100% { transform: translateX(220%) skewX(-18deg); opacity: 0; }
                }
                .bar-shine {
                    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.28) 50%, transparent 100%);
                    animation: shine-sweep 3s ease-in-out 1.2s infinite;
                }

                @keyframes row-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .row-appear { animation: row-in 0.35s ease-out both; }

                @keyframes bar-expand {
                    from { width: 0; }
                    to   { width: var(--bar-width); }
                }
                .bar-fill {
                    width: 0;
                    animation: bar-expand 0.6s cubic-bezier(.22,1,.36,1) both;
                }

                .size-18 { width: 4.5rem; height: 4.5rem; }
            `}</style>

            <div className="flex flex-1 flex-col gap-8 overflow-auto py-6">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 lg:px-6">
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl font-semibold">
                            Ranking de Pontuação
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Top 10 arquitetos com mais pontos em {YEAR}
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className="gap-1.5 px-3 py-1 text-xs"
                    >
                        <span className="size-1.5 animate-pulse rounded-full bg-amber-400" />
                        {YEAR}
                    </Badge>
                </div>

                {/* Podium bars */}
                {top3.length >= 3 && (
                    <div className="relative px-4 lg:px-6">
                        <div
                            className="flex items-end justify-center gap-4"
                            style={{
                                WebkitMaskImage:
                                    'linear-gradient(to top, transparent 0%, black 22%)',
                                maskImage:
                                    'linear-gradient(to top, transparent 0%, black 22%)'
                            }}
                        >
                            <PodiumBar
                                rank={2}
                                entry={top3[1]}
                                maxPoints={maxPoints}
                                animDelay={80}
                            />
                            <PodiumBar
                                rank={1}
                                entry={top3[0]}
                                maxPoints={maxPoints}
                                animDelay={0}
                            />
                            <PodiumBar
                                rank={3}
                                entry={top3[2]}
                                maxPoints={maxPoints}
                                animDelay={160}
                            />
                        </div>
                    </div>
                )}

                {/* List 4–10 */}
                {rest.length > 0 && (
                    <div className="flex flex-col gap-0.5 px-4 lg:px-6">
                        <p className="text-muted-foreground mb-3 px-3 text-xs font-semibold tracking-widest uppercase">
                            Classificação geral
                        </p>
                        {rest.map((entry, i) => (
                            <RankingRow
                                key={entry.architect_id}
                                rank={i + 4}
                                entry={entry}
                                maxPoints={maxPoints}
                                delay={i * 55}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
