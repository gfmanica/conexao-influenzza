import { useState } from 'react';

import { Link, useRouteContext, useRouter, useRouterState } from '@tanstack/react-router';
import {
    LayoutDashboardIcon,
    LogOutIcon,
    PencilIcon,
    StarIcon,
    UsersIcon
} from 'lucide-react';
import { toast } from 'sonner';

import { PhotoAvatar } from '@/components/photo-upload/photo-avatar';
import { ProfileForm } from '@/components/sidebar/profile-form';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { logout } from '@/server/auth';

const adminNavItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboardIcon },
    { title: 'Arquitetos', url: '/architects', icon: UsersIcon },
    { title: 'Pontuações', url: '/points', icon: StarIcon }
];

const architectNavItems = [
    { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboardIcon }
];

function NavItem({ title, url, icon: Icon }: { title: string; url: string; icon: React.ElementType }) {
    const isActive = useRouterState({
        select: (state) => state.location.pathname.startsWith(url)
    });

    return (
        <Link
            to={url}
            className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors',
                isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
            )}
        >
            <Icon
                className={cn(
                    'size-5 transition-colors',
                    isActive && 'text-primary'
                )}
            />
            <span>{title}</span>
        </Link>
    );
}

export function MobileBottomNav() {
    const { user } = useRouteContext({ from: '/(app)' });
    const router = useRouter();
    const navItems = user.role === 'admin' ? adminNavItems : architectNavItems;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    async function handleLogout() {
        try {
            setDrawerOpen(false);
            await logout();
            await router.invalidate();
            router.navigate({ to: '/login' });
        } catch {
            toast.error('Erro ao sair. Tente novamente.');
        }
    }

    function handleEditProfile() {
        setDrawerOpen(false);
        setProfileOpen(true);
    }

    return (
        <>
            <ProfileForm user={user} open={profileOpen} onOpenChange={setProfileOpen} />

            {/* Bottom Nav Bar */}
            <nav className="fixed right-0 bottom-0 left-0 z-50 flex items-stretch border-t bg-background/95 backdrop-blur-sm md:hidden">
                {navItems.map((item) => (
                    <NavItem key={item.url} {...item} />
                ))}

                {/* Profile trigger */}
                <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Perfil"
                >
                    <PhotoAvatar
                        photoUrl={user.photoUrl || ''}
                        name={user.name}
                        size="sm"
                    />
                    <span>Perfil</span>
                </button>
            </nav>

            {/* Profile drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader className="px-4 pt-3 pb-0">
                        <DrawerTitle className="sr-only">Menu</DrawerTitle>

                        {/* User card */}
                        <div className="relative flex items-center justify-center py-2">
                            <PhotoAvatar
                                photoUrl={user.photoUrl || ''}
                                name={user.name}
                                size="default"
                                className="absolute left-0"
                            />
                            <div className="flex flex-col items-center">
                                <span className="text-sm font-semibold leading-tight">{user.name}</span>
                                <span className="text-muted-foreground text-xs">{user.email}</span>
                            </div>
                        </div>
                    </DrawerHeader>

                    <Separator className="mt-2" />

                    <div className="flex flex-col gap-0.5 px-2 py-2 pb-6">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                            onClick={handleEditProfile}
                        >
                            <PencilIcon className="size-4" />
                            Editar Perfil
                        </Button>

                        <Button
                            variant="ghost"
                            className="text-destructive hover:text-destructive w-full justify-start gap-2"
                            onClick={handleLogout}
                        >
                            <LogOutIcon className="size-4" />
                            Sair
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
