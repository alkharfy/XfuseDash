"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Client, User } from "@/lib/types";
import { collection, query } from "firebase/firestore";
import { useAuthStore } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatCard from "@/components/dashboard/stat-card";
import { ClientsStatusChart } from "@/components/reports/clients-status-chart";
import { TeamPerformanceChart } from "@/components/reports/team-performance-chart";
import { BarChart, FileText, Activity, Users, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";

export default function ReportsPage() {
  const { user, role } = useAuthStore();
  const firestore = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "clients"));
  }, [firestore]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "users"));
  }, [firestore]);

  const { data: clients, isLoading: isLoadingClients } = useCollection<Client>(clientsQuery);
  const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const isLoading = isLoadingClients || isLoadingUsers;

  const clientStatusData = useMemo(() => {
    if (!clients) return [];
    const statusCounts: { [key: string]: number } = {};
    clients.forEach(client => {
      const status = client.prStatus || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [clients]);

  const teamPerformanceData = useMemo(() => {
    if (!clients || !users) return [];
    const performanceCounts: { [key: string]: { name: string; tasks: number } } = {};

    users.forEach(user => {
      performanceCounts[user.id] = { name: user.name, tasks: 0 };
    });

    clients.forEach(client => {
      if (client.assignedToPR && performanceCounts[client.assignedToPR]) {
        performanceCounts[client.assignedToPR].tasks++;
      }
      if (client.assignedCreative && performanceCounts[client.assignedCreative]) {
        performanceCounts[client.assignedCreative].tasks++;
      }
       if (client.writingResponsible && performanceCounts[client.writingResponsible]) {
        performanceCounts[client.writingResponsible].tasks++;
      }
    });

    return Object.values(performanceCounts).filter(u => u.tasks > 0);
  }, [clients, users]);
  
  if (role && !['admin', 'moderator'].includes(role)) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-center" dir="rtl">
              <BarChart className="h-24 w-24 text-muted-foreground mb-4" />
              <h1 className="text-3xl font-bold">صفحة التقارير</h1>
              <p className="text-muted-foreground mt-2">هذه الصفحة متاحة للمديرين والمشرفين فقط.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-headline font-bold">التقارير والتحليلات</h1>
          <p className="text-muted-foreground">عرض تحليلات ورؤى حول أداء الفريق والعملاء.</p>
        </div>
        <Separator/>
      </div>

      {isLoading ? (
         <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span>جاري تحميل بيانات التقارير...</span>
            </div>
         </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard title="إجمالي العملاء" value={clients?.length || 0} icon={Users} />
              <StatCard title="إجمالي المستخدمين" value={users?.length || 0} icon={Activity} />
              <StatCard title="عملاء معتمدون" value={clients?.filter(c => c.transferStatus === 'approved').length || 0} icon={FileText} />
              <StatCard title="مهام إبداعية" value={clients?.filter(c => c.serviceRequests?.creative).length || 0} icon={BarChart} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>توزيع حالات العملاء</CardTitle>
                <CardDescription>نظرة عامة على الحالة الحالية لجميع العملاء.</CardDescription>
              </CardHeader>
              <CardContent>
                <ClientsStatusChart data={clientStatusData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أداء أعضاء الفريق</CardTitle>
                <CardDescription>عدد المهام أو العملاء الموكلين لكل عضو في الفريق.</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamPerformanceChart data={teamPerformanceData} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
