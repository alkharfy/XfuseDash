"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import Header from '@/components/layout/header';
import SidebarNav from '@/components/layout/sidebar-nav';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/hooks/use-auth';
import { doc } from 'firebase/firestore';
import type { User as AppUser } from '@/lib/types';
import BottomNavBar from '@/components/layout/bottom-nav-bar';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const { setUser, setRole, role } = useAuthStore();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  useEffect(() => {
    if (!isUserLoading && !isAppUserLoading) {
      if (user && appUser) {
        setUser(user);
        setRole(appUser.role);
      } else if (!user) {
        router.push('/login');
      }
    }
  }, [user, appUser, isUserLoading, isAppUserLoading, router, setUser, setRole]);

  if (isUserLoading || isAppUserLoading || !user || !role) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <SidebarNav />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
        <BottomNavBar />
      </div>
    </div>
  );
}
