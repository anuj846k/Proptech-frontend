'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Building2,
  LayoutDashboard,
  LogOut,
  Wrench,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navItems: { icon: typeof LayoutDashboard; href: string; label: string; roles?: string[] }[] = [
  { icon: LayoutDashboard, href: '/dashboard', label: 'Dashboard', roles: undefined },
  { icon: Wrench, href: '/dashboard/maintenance', label: 'Maintenance', roles: undefined },
  { icon: Bell, href: '/dashboard/notifications', label: 'Notifications', roles: undefined },
  {
    icon: Building2,
    href: '/dashboard/properties',
    label: 'Properties',
    roles: ['ADMIN', 'MANAGER'],
  },
];

export default function DashboardSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const visibleItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? '?';

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <aside className="flex flex-col items-center gap-9 overflow-hidden py-11 w-[76px] shrink-0">
      <Link
        href="/dashboard"
        className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500 text-white"
        aria-label="Home"
      >
        <Building2 className="h-7 w-7" />
      </Link>

      <div className="flex flex-col gap-[60px] items-center w-[76px]">
        <nav className="flex flex-col gap-[60px] items-center bg-white rounded-[54px] w-[76px] py-3 px-2 shadow-sm">
          {visibleItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-[60px] w-[60px] items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'bg-white text-[#201f23] hover:bg-brand-50'
                }`}
                aria-label={item.label}
              >
                <item.icon className="h-6 w-6" />
              </Link>
            );
          })}
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-12 w-12 rounded-full bg-brand-100 hover:bg-brand-200 p-0"
              aria-label="Profile menu"
            >
              <Avatar className="h-12 w-12 rounded-full">
                <AvatarFallback className="rounded-full bg-brand-100 text-sm font-medium text-brand-700">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <span className="font-medium">{user?.name ?? 'User'}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
                {user?.role && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {user.role.replace('_', ' ')}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer focus:bg-destructive/10 focus:text-destructive"
              onSelect={handleLogout}
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
