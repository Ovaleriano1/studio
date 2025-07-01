
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
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
  Hammer,
  CalendarCheck,
  ShieldCheck,
  LifeBuoy,
  FlaskConical,
  FileSignature,
  FilePlus,
  FileSpreadsheet,
  Calendar,
  ListChecks,
  AreaChart,
  ChevronRight,
} from 'lucide-react';
import { useUserProfile } from '@/context/user-profile-context';

export function AppSidebar() {
  const pathname = usePathname();
  const { profile } = useUserProfile();
  const [isContractsOpen, setIsContractsOpen] = useState(false);

  const roleDisplayNames: { [key: string]: string } = {
    admin: 'Administrador',
    superuser: 'Superusuario',
    supervisor: 'Supervisor',
    'user-technicians': 'Técnico',
  };

  return (
    <>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-3 p-2">
          <Image src="/LOGOCamosaCC.png" alt="CAMOSA Logo" width={40} height={40} />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-sidebar-primary font-headline">CAMOSA App Tecnicos</h1>
          </div>
        </Link>
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
           <SidebarMenuItem>
            <Link href="/reports" passHref>
              <SidebarMenuButton isActive={pathname === '/reports'}>
                <FileSpreadsheet />
                Reportes
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          {['admin', 'superuser', 'supervisor'].includes(profile.role) && (
            <SidebarMenuItem>
              <Link href="/status" passHref>
                <SidebarMenuButton isActive={pathname.startsWith('/status')}>
                  <ListChecks />
                  Estados
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            <Link href="/calendar" passHref>
              <SidebarMenuButton isActive={pathname.startsWith('/calendar')}>
                <Calendar />
                Calendario
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
                {profile.role !== 'supervisor' && (
                  <SidebarMenuItem>
                    <Link href="/forms/work-order" passHref>
                      <SidebarMenuButton isActive={pathname.startsWith('/forms/work-order')}>
                        <FileText />
                        Orden de Trabajo
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )}
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
                  <Link href="/forms/general-report" passHref>
                    <SidebarMenuButton isActive={pathname.startsWith('/forms/general-report')}>
                      <FilePlus />
                      Reporte General
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              </SidebarMenu>
              {['admin', 'supervisor'].includes(profile.role) && (
                 <div className="pt-2">
                    <button
                        className="flex items-center justify-between w-full h-8 px-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground/70"
                        onClick={() => setIsContractsOpen(!isContractsOpen)}
                    >
                        <span className="text-xs font-medium">
                        Contratos y Garantias
                        </span>
                        <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isContractsOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isContractsOpen && (
                        <div className="pl-4 pt-1">
                            <SidebarMenu>
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
                            </SidebarMenu>
                        </div>
                    )}
                </div>
              )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2 bg-sidebar-border" />
        <SidebarMenu>
          {['admin', 'supervisor'].includes(profile.role) && (
              <SidebarMenuItem>
                <Link href="/analytics" passHref>
                  <SidebarMenuButton isActive={pathname === '/analytics'}>
                    <AreaChart />
                    Análisis Gráfico
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
          )}
          {profile.role === 'admin' && (
            <SidebarMenuItem>
              <Link href="/settings" passHref>
                <SidebarMenuButton isActive={pathname.startsWith('/settings')}>
                  <Settings />
                  Configuración
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        <Link href="/profile" className="p-2 flex items-center gap-3 rounded-md hover:bg-sidebar-accent">
          <div className="flex items-center gap-3">
            <Avatar className="size-9">
              <AvatarImage src={profile.avatar} alt="User avatar" data-ai-hint="user avatar" />
              <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-sm truncate text-sidebar-foreground">{profile.name}</span>
              <span className="text-xs text-sidebar-foreground/70">{roleDisplayNames[profile.role]}</span>
            </div>
          </div>
        </Link>
      </SidebarFooter>
    </>
  );
}
