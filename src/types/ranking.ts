import type { getRanking } from '@/server/ranking';

export type ArchitectRanking = Awaited<ReturnType<typeof getRanking>>;
