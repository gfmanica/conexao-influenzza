import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getSession } from '@/server/auth';

export const Route = createFileRoute('/_app')({
    beforeLoad: async () => {
        const user = await getSession();

        if (!user) throw redirect({ to: '/login' });

        return { user };
    },
    component: RouteComponent
});

function RouteComponent() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Outlet />
            </SidebarInset>
        </SidebarProvider>
    );
}
