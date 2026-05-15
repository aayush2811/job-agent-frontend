'use client';

import { Menu, Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SocketStatusBadge } from '@/components/socket/SocketStatusBadge';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { toggleSidebar } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/60 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground lg:hidden"
        onClick={toggleSidebar}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-x-4 lg:gap-x-6">
        <div className="flex items-center gap-2">
          <SocketStatusBadge />
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <ThemeToggle />

          <button type="button" className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center outline-none">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold cursor-pointer hover:bg-primary/20 transition-colors">
                A
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">Admin User</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">admin@example.com</p>
                </div>
              </div>
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/50 cursor-pointer mt-2"
                onClick={() => {
                  document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
                  localStorage.removeItem('auth-storage');
                  window.location.href = '/login';
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
