"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/src/components/ui/sidebar"
import { AppSidebar } from "@/src/components/ui/app-sidebar"
import { TopNavigation } from "@/src/components/ui/top-navigation"
import { useAuth } from "@/src/features/auth/hooks/useAuth";
import { ROUTES } from "@/src/constants/routes";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
    } else {
      Promise.resolve().then(() => {
        setIsChecking(false);
      });
    }
  }, [initialized, isAuthenticated, router]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex flex-col w-full min-w-0 min-h-screen animate-fade-in duration-300">
        <header className="flex h-14 items-center gap-4 border-b px-4 lg:h-[60px]">
          <SidebarTrigger />
          <TopNavigation />
        </header>
        <div className="flex-1 p-6">
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
