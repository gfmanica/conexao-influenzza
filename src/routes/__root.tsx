import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import appCss from '../styles.css?url';

export const Route = createRootRoute({
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
                href: '/public/favicon/favicon-96x96.png',
                sizes: '96x96'
            },
            {
                rel: 'icon',
                type: 'image/svg+xml',
                href: '/public/favicon/favicon.svg'
            },
            {
                rel: 'shortcut icon',
                href: '/public/favicon/favicon.ico'
            },
            {
                rel: 'apple-touch-icon',
                sizes: '180x180',
                href: '/public/favicon/apple-touch-icon.png'
            },
            {
                rel: 'manifest',
                href: '/public/webmanifest.json'
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
                {children}

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
