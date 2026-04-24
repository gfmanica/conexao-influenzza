import { inferAdditionalFields, magicLinkClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

import type { auth } from '@/lib/auth';

export const authClient = createAuthClient({
    plugins: [magicLinkClient(), inferAdditionalFields<typeof auth>()]
});
