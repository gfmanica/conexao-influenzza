import { Link, useRouterState } from '@tanstack/react-router';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';

type NavItem = {
    title: string;
    url: string;
    icon?: React.ReactNode;
};

function NavMainItem({ item }: { item: NavItem }) {
    const isActive = useRouterState({
        select: (state) => state.location.pathname.startsWith(item.url)
    });

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                tooltip={item.title}
                isActive={isActive}
                render={<Link to={item.url} />}
            >
                {item.icon}
                <span>{item.title}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

export function NavMain({ items }: { items: NavItem[] }) {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map((item) => (
                        <NavMainItem key={item.title} item={item} />
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
