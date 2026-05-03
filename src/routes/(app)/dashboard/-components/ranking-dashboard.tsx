import { useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { TrophyIcon } from 'lucide-react';

import { Combobox } from '@/components/ui/combobox';

import { rankingQueryOptions } from '../-hooks/use-ranking';
import { PodiumBar } from './podium-bar';
import { RankingRow } from './ranking-row';

const MONTH_NAMES = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
];

const RANKING_STYLES = `
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
`;

type MonthOption = { value: number; label: string };

const currentMonth = new Date().getMonth() + 1;

const availableMonths: MonthOption[] = MONTH_NAMES.slice(0, currentMonth).map((name, i) => ({
    value: i + 1,
    label: name
}));

export function RankingDashboard() {
    const year = new Date().getFullYear();
    const [selectedMonth, setSelectedMonth] = useState<MonthOption>(
        availableMonths[currentMonth - 1]
    );
    const month = selectedMonth.value;
    const { data = [] } = useQuery(rankingQueryOptions(month));

    const top3 = data.slice(0, 3);
    const rest = data.slice(3);
    const maxPoints = data[0]?.totalPoints ?? 1;

    return (
        <>
            <style>{RANKING_STYLES}</style>

            <div className="flex flex-1 flex-col gap-8 overflow-auto py-6">
                <div className="flex flex-col gap-3 px-4 sm:flex-row sm:items-center lg:px-6">
                    <div className="flex-1">
                        <h1 className="font-heading text-2xl font-semibold">
                            Ranking de Pontuação
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Top 10 arquitetos com mais pontos em {MONTH_NAMES[month - 1]} de {year}
                        </p>
                    </div>

                    <Combobox<MonthOption>
                        value={selectedMonth}
                        onChange={(item) =>
                            setSelectedMonth(item ?? availableMonths[currentMonth - 1])
                        }
                        options={availableMonths}
                        keyField="value"
                        displayField="label"
                        placeholder="Selecione o mês"
                        searchPlaceholder="Buscar mês..."
                        className="w-full sm:w-48"
                    />
                </div>

                {data.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-6 text-center">
                        <TrophyIcon className="text-muted-foreground/40 size-16" />
                        <div className="flex flex-col gap-1">
                            <p className="text-foreground text-base font-semibold">
                                Nenhuma pontuação registrada
                            </p>
                            <p className="text-muted-foreground text-sm">
                                O ranking aparecerá aqui assim que houver lançamentos de pontos para
                                os arquitetos.
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {top3.length > 0 && (
                            <div className="relative px-4 lg:px-6">
                                <div
                                    className="flex items-end justify-center gap-4 pt-6"
                                    style={{
                                        WebkitMaskImage:
                                            'linear-gradient(to top, transparent 0%, black 22%)',
                                        maskImage:
                                            'linear-gradient(to top, transparent 0%, black 22%)'
                                    }}
                                >
                                    {top3[1] && (
                                        <PodiumBar
                                            rank={2}
                                            entry={top3[1]}
                                            maxPoints={maxPoints}
                                            animDelay={80}
                                        />
                                    )}
                                    <PodiumBar
                                        rank={1}
                                        entry={top3[0]}
                                        maxPoints={maxPoints}
                                        animDelay={0}
                                    />
                                    {top3[2] && (
                                        <PodiumBar
                                            rank={3}
                                            entry={top3[2]}
                                            maxPoints={maxPoints}
                                            animDelay={160}
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {rest.length > 0 && (
                            <div className="flex flex-col gap-0.5 px-4 lg:px-6">
                                <p className="text-muted-foreground mb-3 px-3 text-xs font-semibold tracking-widest uppercase">
                                    Classificação geral
                                </p>
                                {rest.map((entry, i) => (
                                    <RankingRow
                                        key={entry.architectId}
                                        rank={i + 4}
                                        entry={entry}
                                        maxPoints={maxPoints}
                                        delay={i * 55}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
