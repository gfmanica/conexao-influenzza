import * as React from 'react';

import {
    LayoutDashboardIcon,
    StarIcon,
    TrophyIcon,
    UsersIcon
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: <LayoutDashboardIcon />
    },
    {
        title: 'Arquitetos',
        url: '/arquitetos',
        icon: <UsersIcon />
    },
    {
        title: 'Pontuações',
        url: '/pontuacoes',
        icon: <StarIcon />
    }
];

const mockUser = {
    name: 'Administrador',
    email: 'admin@conexaoinfluenzza.com.br',
    avatar: ''
};

function SidebarHeaderContent() {
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';

    return (
        <SidebarMenu className="flex flex-col gap-2 pt-2">
            <SidebarMenuItem>
                <div
                    className={cn(
                        'flex items-start',
                        collapsed ? '' : 'pr-1 pb-1 pl-2',
                        collapsed ? 'justify-center' : 'justify-between'
                    )}
                >
                    {collapsed ? (
                        <>
                            <img
                                src="/logo/logo-black.png"
                                alt="Conexão Influenzza"
                                className="h-auto w-5 object-contain dark:hidden"
                            />

                            <img
                                src="/logo/logo-white.png"
                                alt="Conexão Influenzza"
                                className="hidden h-auto w-5 object-contain dark:block"
                            />
                        </>
                    ) : (
                        <>
                            <img
                                src="/logo/logomarca-horizontal-black.png"
                                alt="Conexão Influenzza"
                                className="h-12 w-auto object-contain dark:hidden"
                            />

                            <img
                                src="/logo/logomarca-horizontal-white.png"
                                alt="Conexão Influenzza"
                                className="hidden h-12 w-auto object-contain dark:block"
                            />

                            <SidebarTrigger className="-mt-1 -mr-1 shrink-0" />
                        </>
                    )}
                </div>
            </SidebarMenuItem>

            {collapsed && (
                <SidebarMenuItem className="flex justify-center">
                    <SidebarTrigger />
                </SidebarMenuItem>
            )}
        </SidebarMenu>
    );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarHeaderContent />
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser user={mockUser} />
            </SidebarFooter>
        </Sidebar>
    );
}
