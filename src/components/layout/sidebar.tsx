'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Home,
  Wrench,
  ClipboardList,
  FileText,
  Settings,
  HardHat,
  Hammer,
  CalendarCheck,
  ShieldCheck,
  LifeBuoy,
  FlaskConical,
  FileSignature,
  FilePlus,
} from 'lucide-react';

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <HardHat className="size-8 text-sidebar-primary" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-sidebar-primary font-headline">CamosaApp Tecnicos</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/" passHref>
              <SidebarMenuButton isActive={pathname === '/'}>
                <Home />
                Dashboard
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel>Formularios</SidebarGroupLabel>
          <SidebarGroupContent>
             <SidebarMenu>
                <SidebarMenuItem>
                  <Link href="/forms/maintenance" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/maintenance')}>
                      <Wrench />
                      Mantenimiento
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/forms/inspection" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/inspection')}>
                      <ClipboardList />
                      Inspección
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/forms/work-order" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/work-order')}>
                      <FileText />
                      Orden de Trabajo
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/forms/repair" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/repair')}>
                      <Hammer />
                      Reparación
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/forms/programmed-visit" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/programmed-visit')}>
                      <CalendarCheck />
                      Visita Programada
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                  <Link href="/forms/warranty" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/warranty')}>
                      <ShieldCheck />
                      Garantía
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/forms/safety-compliance" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/safety-compliance')}>
                      <LifeBuoy />
                      Cumplimiento de Seguridad
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/forms/fluid-analysis" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/fluid-analysis')}>
                      <FlaskConical />
                      Análisis de Fluidos
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/forms/rental-agreement" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/rental-agreement')}>
                      <FileSignature />
                      Contrato de Alquiler
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <Link href="/forms/general-report" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/general-report')}>
                      <FilePlus />
                      Reporte General
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2 bg-sidebar-border" />
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" passHref>
              <SidebarMenuButton isActive={pathname.startsWith('/settings')}>
                <Settings />
                Configuración
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
        <Link href="/profile" className="p-2 flex items-center gap-3 rounded-md hover:bg-sidebar-accent">
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="user avatar" />
              <AvatarFallback>JG</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm truncate text-sidebar-foreground">Juan Gomez</span>
              <span className="text-xs text-sidebar-foreground/70">Tecnico</span>
            </div>
          </div>
        </Link>
      </SidebarFooter>
    </>
  );
}
