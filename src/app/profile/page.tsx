import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/header';
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { ProfileCard } from '@/components/profile-card';

export default function ProfilePage() {
  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar />
      </Sidebar>
      <SidebarInset>
        <AppHeader title="Perfil de Usuario" />
        <main className="p-4 lg:p-6">
           <ProfileCard />
        </main>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  );
}
