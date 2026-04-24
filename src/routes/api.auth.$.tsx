import { createFileRoute } from '@tanstack/react-router';

import { auth } from '@/lib/auth';

export const Route = createFileRoute('/api/auth/$')({
    server: {
        handlers: {
            POST: async ({ request }) => auth.handler(request),
            GET: async ({ request }) => auth.handler(request)
        }
    }
});
