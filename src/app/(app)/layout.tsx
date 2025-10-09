"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/layout/header';
import SidebarNav from '@/components/layout/sidebar-nav';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { setUser, setRole } = useAuthStore();

  useEffect(() => {
    if (!isUserLoading) {
      if (user) {
        // Mock role setting, replace with actual role from user data in Firestore
        // For now, we'll keep the mock logic but based on the real authenticated user.
        const mockRoles: { [key: string]: 'moderator' | 'pr' | 'market_researcher' | 'creative' | 'content' } = {
          'moderator@marketflow.com': 'moderator',
          'pr@marketflow.com': 'pr',
          'researcher@marketflow.com': 'market_researcher',
          'creative@marketflow.com': 'creative',
          'content@marketflow.com': 'content',
        };
        const role = user.email ? mockRoles[user.email] : null;
        setUser(user);
        if (role) {
          setRole(role);
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, router, setUser, setRole]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <SidebarNav />
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 p-4 sm:p-6 md:p-8 bg-background">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
