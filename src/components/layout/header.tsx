'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function AppHeader({ title }: { title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === '/';

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:h-16 sm:px-6">
      <SidebarTrigger className="md:hidden" />
      
      {!isDashboard && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Atrás</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Atrás</p>
          </TooltipContent>
        </Tooltip>
      )}

      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl font-headline">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/login" passHref>
              <Button variant="ghost" size="icon">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Cerrar sesión</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cerrar sesión</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
