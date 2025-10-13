"use client";

import Link from "next/link";
import { useAuthStore } from "@/hooks/use-auth";
import StatCard from "@/components/dashboard/stat-card";
import { Client, UserRole } from "@/lib/types";
import { BarChart, Briefcase, CheckCircle, Clock, Users, Zap, Loader2, Home, Filter, RefreshCw, Download, ListTodo } from "lucide-react";
import ClientList from "@/components/clients/client-list";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelativeDate } from "@/lib/utils";

const getStatsForRole = (role: UserRole, userId: string, clients: Client[] | null) => {
  if (!clients) {
    return [
      { title: "...", value: "...", icon: Zap },
      { title: "...", value: "...", icon: Users },
      { title: "...", value: "...", icon: Clock },
      { title: "...", value: "...", icon: Briefcase },
    ];
  }
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (role) {
    case "moderator":
    case "admin":
      const myClients = clients.filter((c) => c.registeredBy === userId || role === 'admin');
      return [
        { title: "عملاء اليوم", value: myClients.filter((c) => c.registeredAt && new Date(c.registeredAt.seconds * 1000) >= todayStart).length, icon: Zap },
        { title: "العملاء النشطون", value: myClients.filter((c) => c.transferStatus === "active").length, icon: Users },
        { title: "قيد المراجعة", value: myClients.filter((c) => c.prStatus === "pending" || c.prStatus === "under_review").length, icon: Clock },
        { title: "إجمالي العملاء", value: myClients.length, icon: Briefcase },
      ];
    case "pr":
      const prClients = clients.filter((c) => c.assignedToPR === userId);
      const todayAppointments = prClients
        .flatMap((c) => c.prAppointments || [])
        .filter((a) => a.date && new Date(a.date.seconds * 1000) >= todayStart && new Date(a.date.seconds * 1000) < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000));
      return [
        { title: "مهام اليوم", value: todayAppointments.length, icon: Clock },
        { title: "عملاء قيد التنفيذ", value: prClients.filter((c) => c.prStatus === "in_progress").length, icon: Zap },
        { title: "عملاء معتمدون", value: prClients.filter((c) => c.transferStatus === "approved").length, icon: CheckCircle },
        { title: "إجمالي العملاء", value: prClients.length, icon: Briefcase },
      ];
    default:
      const assignedClients = clients.filter(
        (c) =>
          (role === "market_researcher" && c.serviceRequests?.marketResearch) ||
          (role === "creative" && c.serviceRequests?.creative) ||
          (role === "content" && c.serviceRequests?.content)
      );
      const statusKey = `${role.split("_")[0]}Status` as keyof Client;
      return [
        { title: "المهام المعلقة", value: assignedClients.filter((c) => c[statusKey] === "pending" || c[statusKey] === "in_progress").length, icon: Clock },
        { title: "المهام المكتملة", value: assignedClients.filter((c) => c[statusKey] === "completed").length, icon: CheckCircle },
        { title: "إجمالي المهام", value: assignedClients.length, icon: Briefcase },
        { title: "متوسط وقت الإنجاز", value: "3 أيام", icon: BarChart },
      ];
  }
};

const getTasksForRole = (role: UserRole, userId: string, clients: Client[] | null) => {
    if (!clients) return [];
  
    const now = new Date();
    let tasks: any[] = [];
  
    switch (role) {
      case 'pr':
        clients.forEach(c => {
          if (c.assignedToPR === userId) {
            c.prAppointments?.forEach(appt => {
              if (appt.status === 'scheduled' && new Date(appt.date.seconds * 1000) >= now) {
                tasks.push({
                  title: `موعد مكالمة مع ${c.name}`,
                  clientName: c.name,
                  dueDate: new Date(appt.date.seconds * 1000),
                  link: `/clients/${c.id}`,
                  status: 'scheduled',
                });
              }
            });
          }
        });
        break;
  
      case 'market_researcher':
        clients.forEach(c => {
          if (c.serviceRequests?.marketResearch && c.researchStatus !== 'completed') {
            tasks.push({
              title: `إجراء بحث سوقي`,
              clientName: c.name,
              dueDate: null,
              link: `/clients/${c.id}`,
              status: c.researchStatus || 'pending',
            });
          }
        });
        break;
  
      case 'creative':
        clients.forEach(c => {
          if ((c.assignedCreative === userId || c.serviceRequests?.creative) && c.creativeStatus !== 'completed') {
            tasks.push({
              title: `العمل على الجانب الإبداعي`,
              clientName: c.name,
              dueDate: null,
              link: `/clients/${c.id}`,
              status: c.creativeStatus || 'pending',
            });
          }
        });
        break;
  
      case 'content':
        clients.forEach(c => {
          c.contentTasks?.forEach(task => {
            if (task.assignedTo === userId && task.status !== 'completed') {
              tasks.push({
                title: task.title,
                clientName: c.name,
                dueDate: new Date(task.dueDate.seconds * 1000),
                link: `/clients/${c.id}`,
                status: task.status,
              });
            }
          });
        });
        break;
    }
  
    return tasks.sort((a, b) => (a.dueDate || Infinity) - (b.dueDate || Infinity));
  };

export default function DashboardPage() {
  const { user, role } = useAuthStore();
  const firestore = useFirestore();

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "clients"));
  }, [firestore]);

  const { data: clients, isLoading } = useCollection<Client>(clientsQuery);

  if (!user || !role) return null;

  const stats = getStatsForRole(role, user.uid, clients);
  const tasks = getTasksForRole(role, user.uid, clients);

  const recentClients = clients
    ? [...clients]
        .filter((c) => (role === "moderator" && c.registeredBy === user.uid) || role === 'admin')
        .sort((a, b) => (b.registeredAt?.seconds || 0) - (a.registeredAt?.seconds || 0))
        .slice(0, 5)
    : [];

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="text-sm text-muted-foreground flex items-center gap-2">
            <Home className="h-4 w-4" /> 
            <span className="text-foreground">لوحة التحكم الرئيسية</span>
          </nav>
          <Badge variant="outline" className="rounded-2xl px-3 py-1">الدور: {role}</Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="bg-gradient-to-l from-fuchsia-500/10 via-purple-500/10 to-pink-500/10 p-6">
          <CardTitle className="text-2xl sm:text-3xl font-headline">مرحباً, {user.displayName || user.email}!</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">هنا نظرة سريعة على أنشطتك اليوم.</p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => <StatCard key={i} title="..." value="..." icon={Loader2} />)
          : stats.map((stat, index) => <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />)}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                    <ListTodo className="text-primary" />
                    مهامي القادمة
                </CardTitle>
            </CardHeader>
            <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : tasks.length > 0 ? (
                <ScrollArea className="h-[60vh] pe-2">
                    <div className="space-y-3">
                        {tasks.map((task, index) => (
                            <Link key={index} href={task.link} className="block p-3 border rounded-lg hover:bg-muted transition-colors">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{task.title}</p>
                                    <Badge variant="secondary" className="text-xs">{task.clientName}</Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{task.dueDate ? formatRelativeDate(task.dueDate) : "غير محدد"}</span>
                                    <Separator orientation="vertical" className="h-4" />
                                    <span>الحالة: {task.status}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
                    <p className="font-medium">لا توجد مهام قادمة!</p>
                    <p className="text-sm text-muted-foreground">كل شيء منجز حتى الآن.</p>
                </div>
            )}
            </CardContent>
        </Card>

        {(role === "moderator" || role === "admin") && (
            <Card>
            <CardHeader>
                <CardTitle className="text-xl font-headline">أحدث العملاء</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                ) : recentClients.length > 0 ? (
                <ScrollArea className="h-[60vh] pe-2">
                    <div className="space-y-3">
                        {recentClients.map(client => (
                            <Link href={`/clients/${client.id}`} key={client.id} className="block p-3 border rounded-lg hover:bg-muted transition-colors">
                                <div className="flex justify-between items-center">
                                    <p className="font-medium">{client.name}</p>
                                    <Badge variant="secondary" className="text-xs">{client.prStatus || 'pending'}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{client.businessName}</p>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
                ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="font-medium">لم يتم إضافة عملاء بعد.</p>
                    <p className="text-sm text-muted-foreground">قم بإضافة عميل جديد للبدء.</p>
                </div>
                )
              }
            </CardContent>
            </Card>
        )}
      </div>

    </div>
  );
}
