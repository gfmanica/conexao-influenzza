import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(auth)')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="grid h-svh lg:grid-cols-2">
            <div className="bg-foreground hidden items-center justify-center lg:flex">
                <img
                    src="/logo/logomarca-vertical-white.png"
                    alt="Logo"
                    className="h-84 object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>

            <div className="flex h-svh flex-col items-center p-6 pt-10 md:p-10">
                <img
                    src="/logo/logomarca-vertical-black.png"
                    alt="Logo"
                    className="mb-4 block h-22 object-cover [image-rendering:-webkit-optimize-contrast] lg:hidden dark:brightness-[0.2] dark:grayscale"
                />

                <div className="flex w-full max-w-xs flex-1 flex-col justify-center py-6 min-h-0">
                    <Outlet />
                </div>

                <div className="text-muted-foreground py-4 text-center text-xs">
                    &copy; {new Date().getFullYear()} Influenzza Caza. Todos os direitos reservados.
                </div>
            </div>
        </div>
    );
}
