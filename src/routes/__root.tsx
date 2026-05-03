import { TanStackDevtools } from '@tanstack/react-devtools';
import { type QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { Toaster } from 'sonner';

import { TooltipProvider } from '@/components/ui/tooltip';

import appCss from '../styles.css?url';

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    head: () => ({
        meta: [
            {
                charSet: 'utf-8'
            },
            {
                name: 'viewport',
                content: 'width=device-width, initial-scale=1'
            },
            {
                title: 'Conexão Influenzza'
            },
            {
                name: 'apple-mobile-web-app-title',
                content: 'Conexão Influenzza'
            }
        ],
        links: [
            {
                rel: 'icon',
                type: 'image/png',
                href: '/favicon/favicon-96x96.png',
                sizes: '96x96'
            },
            {
                rel: 'icon',
                type: 'image/svg+xml',
                href: '/favicon/favicon.svg'
            },
            {
                rel: 'shortcut icon',
                href: '/favicon/favicon.ico'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/favicon/apple-touch-icon.png'
            },
            {
                rel: 'manifest',
                href: '/manifest.json'
            },
            {
                rel: 'stylesheet',
                href: appCss
            }
        ]
    }),
    shellComponent: RootDocument
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>

            <body>
                <Toaster
                    position="bottom-left"
                    toastOptions={{
                        classNames: {
                            // info: 'bg-emerald-400! text-emerald-200! border-emerald-700! [&>[data-icon]]:text-emerald-400! [&_[data-title]]:text-white! [&_[data-title]]:font-semibold!',
                            // warning: 'bg-amber-400! text-amber-200! border-amber-700! [&>[data-icon]]:text-amber-400! [&_[data-title]]:text-white! [&_[data-title]]:font-semibold!',
                            // error: 'bg-red-400! text-red-200! border-red-700! [&>[data-icon]]:text-red-400! [&_[data-title]]:text-white! [&_[data-title]]:font-semibold!',
                            // success: 'bg-emerald-400! text-emerald-200! border-emerald-700! [&>[data-icon]]:text-emerald-400! [&_[data-title]]:text-white! [&_[data-title]]:font-semibold!'
                        }
                    }}
                />

                <TooltipProvider delayDuration={0}>{children}</TooltipProvider>

                <TanStackDevtools
                    config={{
                        position: 'bottom-right'
                    }}
                    plugins={[
                        {
                            name: 'Tanstack Router',
                            render: <TanStackRouterDevtoolsPanel />
                        }
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
