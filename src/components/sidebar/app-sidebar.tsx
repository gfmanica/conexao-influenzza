import { useState, type ComponentProps } from 'react';

import { useRouteContext, useRouter } from '@tanstack/react-router';
import { LayoutDashboardIcon, LogOutIcon, PencilIcon, StarIcon, UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

import { PhotoAvatar } from '@/components/photo-upload/photo-avatar';
import { NavMain } from '@/components/sidebar/nav-main';
import { ProfileForm } from '@/components/sidebar/profile-form';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { logout } from '@/server/auth';

const adminNavItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: <LayoutDashboardIcon />
    },
    {
        title: 'Arquitetos',
        url: '/architects',
        icon: <UsersIcon />
    },
    {
        title: 'Pontuações',
        url: '/points',
        icon: <StarIcon />
    }
];

const architectNavItems = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: <LayoutDashboardIcon />
    }
];

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
                                className="h-10 w-auto object-contain dark:hidden"
                            />

                            <img
                                src="/logo/logomarca-horizontal-white.png"
                                alt="Conexão Influenzza"
                                className="hidden h-10 w-auto object-contain dark:block"
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

function SidebarFooterContent({
    user
}: {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        photoUrl?: string | null;
        officeEmail?: string | null;
        phone?: string | null;
        officeAddress?: string | null;
        birthdate?: string | null;
        cauRegister?: string | null;
        observation?: string | null;
    };
}) {
    const { state } = useSidebar();
    const collapsed = state === 'collapsed';
    const router = useRouter();
    const [profileOpen, setProfileOpen] = useState(false);

    async function handleLogout() {
        try {
            await logout();

            await router.invalidate();

            router.navigate({ to: '/login' });
        } catch {
            toast.error('Erro ao sair. Tente novamente.');
        }
    }

    return (
        <>
            <ProfileForm user={user} open={profileOpen} onOpenChange={setProfileOpen} />

            <SidebarMenu className="gap-1">
                <SidebarMenuItem>
                    <div
                        className={cn(
                            'flex items-center gap-2 px-2 py-1',
                            collapsed && 'justify-center'
                        )}
                    >
                        <PhotoAvatar
                            photoUrl={user.photoUrl || ''}
                            name={user.name}
                            size={collapsed ? 'default' : 'lg'}
                        />

                        {!collapsed && (
                            <div className="grid min-w-0 flex-1">
                                <span className="truncate text-sm font-medium">{user.name}</span>

                                <span className="text-muted-foreground truncate text-xs">
                                    {user.email}
                                </span>
                            </div>
                        )}
                    </div>
                </SidebarMenuItem>

                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={() => setProfileOpen(true)}
                        className={cn(
                            'text-muted-foreground hover:text-foreground',
                            collapsed && 'justify-center'
                        )}
                        tooltip="Editar Perfil"
                    >
                        <PencilIcon />

                        {!collapsed && <span>Editar Perfil</span>}
                    </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={handleLogout}
                        className={cn(
                            'text-muted-foreground hover:text-foreground',
                            collapsed && 'justify-center'
                        )}
                        tooltip="Sair"
                    >
                        <LogOutIcon />

                        {!collapsed && <span>Sair</span>}
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </>
    );
}

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const { user } = useRouteContext({ from: '/(app)' });
    const navItems = user.role === 'admin' ? adminNavItems : architectNavItems;

    return (
        <Sidebar variant="floating" collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarHeaderContent />
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarFooterContent user={user} />
            </SidebarFooter>
        </Sidebar>
    );
}
