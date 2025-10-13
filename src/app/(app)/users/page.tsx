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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <div className="space-y-8 p-4 sm:p-6 lg:p-8" dir="rtl">
            {/* Header Section */}
            <div>
                <h1 className="text-3xl font-headline font-bold text-primary">إدارة المستخدمين</h1>
                <p className="text-muted-foreground mt-2">عرض وتعديل بيانات جميع المستخدمين في النظام.</p>
            </div>

            {/* Action Bar with buttons */}
            <Card className="border-dashed">
                <CardContent>
                    <div className="flex flex-wrap items-center gap-4">
                        <Button variant="outline" size="sm" className="gap-1">
                            <Search className="h-4 w-4" /> بحث
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Filter className="h-4 w-4" /> فلاتر
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                            <Download className="h-4 w-4" /> تصدير CSV
                        </Button>
                        <div className="ms-auto" />
                        <Button size="sm" variant="default">
                            <PlusCircle className="h-4 w-4" /> إضافة مستخدم
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Loader while data is loading */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <UserList users={users || []} />
            )}

            {/* Separator */}
            <Separator />

            {/* Footer with badges */}
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-2xl px-3 py-1">دور: {role}</Badge>
                <Badge variant="outline" className="rounded-2xl px-3 py-1">XFUSE</Badge>
            </div>
        </div>
    );
}
