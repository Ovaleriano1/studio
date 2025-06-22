'use client';

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
} from 'lucide-react';

export function AppSidebar() {
  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
          <HardHat className="size-8 text-sidebar-primary" />
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-sidebar-primary font-headline">ProMaintain</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton isActive>
              <Home />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarGroup>
          <SidebarGroupLabel>Forms</SidebarGroupLabel>
          <SidebarGroupContent>
             <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Wrench />
                    Maintenance
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <ClipboardList />
                    Inspection
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <FileText />
                    Work Order
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator className="my-2 bg-sidebar-border" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <Settings />
              Settings
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="p-2 flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="user avatar" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-sm truncate text-sidebar-foreground">John Doe</span>
            <span className="text-xs text-sidebar-foreground/70">Technician</span>
          </div>
        </div>
      </SidebarFooter>
    </>
  );
}
