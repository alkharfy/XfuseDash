"use client";

import Link from "next/link";
import { useAuthStore } from "@/hooks/use-auth";
import StatCard from "@/components/dashboard/stat-card";
import { Client, UserRole } from "@/lib/types";
import { BarChart, Briefcase, CheckCircle, Clock, Users, Zap, Loader2, Home, Filter, RefreshCw, Download } from "lucide-react";
import ClientList from "@/components/clients/client-list";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      const myClients = clients.filter((c) => c.registeredBy === userId);
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

  const recentClients = clients
    ? [...clients]
        .filter((c) => role === "moderator" && c.registeredBy === user.uid)
        .sort((a, b) => (b.registeredAt?.seconds || 0) - (a.registeredAt?.seconds || 0))
        .slice(0, 5)
    : [];

  return (
    <div className="flex flex-col gap-8" dir="rtl">
      {/* مسار تنقّل ومقدمة */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="text-sm text-muted-foreground flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="h-4 w-4" /> الرئيسية
            </Link>
            <span>/</span>
            <span className="text-foreground">لوحة التحكم</span>
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-2xl px-3 py-1">الدور: {role}</Badge>
            <Badge className="rounded-2xl px-3 py-1">XFUSE</Badge>
          </div>
        </div>
        <Separator />
      </div>

      {/* هيدر مرحِّب بخلفية متدرجة خفيفة */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="bg-gradient-to-l from-fuchsia-500/10 via-purple-500/10 to-pink-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl sm:text-3xl font-headline">مرحباً, {user.displayName || user.email}!</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">هنا نظرة سريعة على أنشطتك اليوم.</p>
          </CardHeader>
        </div>
      </Card>

      {/* بطاقات الإحصائيات — دون تغيير المنطق */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => <StatCard key={i} title="..." value="..." icon={Loader2} />)
          : stats.map((stat, index) => <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />)}
      </div>

      {/* شريط أدوات واجهي أعلى القوائم */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" /> فلاتر (واجهة فقط)
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <RefreshCw className="h-4 w-4" /> تحديث العرض
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Download className="h-4 w-4" /> تصدير CSV
            </Button>
            <div className="ms-auto" />
            <Badge variant="outline" className="rounded-2xl px-3 py-1">قسم التسويق — Xfuse</Badge>
          </div>
        </CardContent>
      </Card>

      {/* أحدث العملاء — نحافظ على الشرط والمنطق */}
      {role === "moderator" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-headline">أحدث العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[60vh] pe-2">
                {/* لا نغيّر أي props جوهرية */}
                <ClientList isPaginated={false} />
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
