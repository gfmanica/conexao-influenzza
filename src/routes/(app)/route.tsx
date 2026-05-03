import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getSession } from '@/server/auth';

export const Route = createFileRoute('/(app)')({
    beforeLoad: async () => {
        const data = await getSession();

        if (!data) throw redirect({ to: '/login' });

        return data;
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
