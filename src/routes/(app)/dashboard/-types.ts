import type { getRanking } from '@/routes/(app)/dashboard/-server';

export type ArchitectRanking = Awaited<ReturnType<typeof getRanking>>;
