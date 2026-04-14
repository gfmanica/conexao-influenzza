export const queryKeys = {
    architects: {
        all: ['architects'] as const,
        detail: (id: string) => ['architects', id] as const
    },
    pointEntries: {
        all: ['point-entries'] as const,
        filtered: (filters: Record<string, string | undefined>) =>
            ['point-entries', filters] as const
    },
    ranking: {
        current: ['ranking'] as const
    },
    me: {
        profile: ['me'] as const,
        entries: ['me', 'entries'] as const
    }
} as const;
