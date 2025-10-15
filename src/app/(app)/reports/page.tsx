"use client";

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Client, User } from "@/lib/types";
import { collection, query } from "firebase/firestore";
import { useAuthStore } from "@/hooks/use-auth";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatCard from "@/components/dashboard/stat-card";
import { ClientsStatusChart } from "@/components/reports/clients-status-chart";
import { TeamPerformanceChart } from "@/components/reports/team-performance-chart";
import { ClientAcquisitionChart } from "@/components/reports/client-acquisition-chart";
import { ServiceRequestsChart } from "@/components/reports/service-requests-chart";
import { BarChart, FileText, Activity, Users, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";
import { format } from "date-fns";

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

  const clientAcquisitionData = useMemo(() => {
    if (!clients) return [];
    const monthlyCounts: { [key: string]: number } = {};
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    clients.forEach(client => {
      if (client.registeredAt) {
        const date = new Date(client.registeredAt.seconds * 1000);
        const month = format(date, "yyyy-MM");
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
      }
    });

    return Object.entries(monthlyCounts)
      .map(([monthStr, count]) => {
        const [year, month] = monthStr.split('-');
        return { month: monthNames[parseInt(month, 10) - 1], clients: count };
      })
      .sort((a, b) => a.month.localeCompare(b.month)); // Simple sort for demo
  }, [clients]);

  const serviceRequestsData = useMemo(() => {
    if (!clients) return [];
    const serviceCounts = { marketResearch: 0, creative: 0, content: 0, aiVideo: 0, ads: 0 };
    clients.forEach(client => {
        if(client.serviceRequests) {
            Object.entries(client.serviceRequests).forEach(([service, requested]) => {
                if (requested && service in serviceCounts) {
                    serviceCounts[service as keyof typeof serviceCounts]++;
                }
            })
        }
    });

    return Object.entries(serviceCounts).map(([name, value]) => ({
      name,
      value,
      fill: `var(--color-${name})`,
    }));
  }, [clients]);
  
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

          <div className="grid gap-6 lg:grid-cols-1">
             <Card>
              <CardHeader>
                <CardTitle>نمو العملاء شهرياً</CardTitle>
                <CardDescription>عدد العملاء الجدد المسجلين كل شهر.</CardDescription>
              </CardHeader>
              <CardContent>
                <ClientAcquisitionChart data={clientAcquisitionData} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>توزيع حالات العملاء</CardTitle>
                <CardDescription>نظرة عامة على الحالة الحالية لجميع العملاء.</CardDescription>
              </CardHeader>
              <CardContent>
                <ClientsStatusChart data={clientStatusData} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>أداء أعضاء الفريق</CardTitle>
                <CardDescription>عدد المهام أو العملاء الموكلين لكل عضو في الفريق.</CardDescription>
              </CardHeader>
              <CardContent>
                <TeamPerformanceChart data={teamPerformanceData} />
              </CardContent>
            </Card>
          </div>

           <div className="grid gap-6 lg:grid-cols-1">
             <Card>
              <CardHeader>
                <CardTitle>توزيع الخدمات المطلوبة</CardTitle>
                <CardDescription>الخدمات الأكثر طلبًا من قبل العملاء.</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ServiceRequestsChart data={serviceRequestsData} />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
