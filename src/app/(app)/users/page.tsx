"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { User } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { UserList } from "@/components/users/user-list";
import { useAuthStore } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Filter, Search, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UsersPage() {
    const { role } = useAuthStore();
    const router = useRouter();
    const firestore = useFirestore();
    const usersQuery = useMemoFirebase(() => {
        // Only fetch users if the current user is an admin
        if (!firestore || role !== 'admin') return null;
        return collection(firestore, 'users');
    }, [firestore, role]);

    const { data: users, isLoading } = useCollection<User>(usersQuery);

    useEffect(() => {
        if (role && role !== 'admin') {
            router.push('/unauthorized');
        }
    }, [role, router]);

    if (role !== 'admin') {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex flex-col gap-3">
                <div>
                  <h1 className="text-3xl font-headline font-bold">إدارة المستخدمين</h1>
                  <p className="text-muted-foreground">عرض وتعديل بيانات جميع المستخدمين في النظام.</p>
                </div>
                <Separator/>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <UserList users={users || []} />
            )}
        </div>
    );
}
