"use client";

import { useAuthStore } from "@/hooks/use-auth";
import StatCard from "@/components/dashboard/stat-card";
import { Client, UserRole } from "@/lib/types";
import { BarChart, Briefcase, CheckCircle, Clock, Users, Zap, Loader2 } from "lucide-react";
import ClientList from "@/components/clients/client-list";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";

const getStatsForRole = (role: UserRole, userId: string, clients: Client[] | null) => {
    if (!clients) {
        return [
            { title: "...", value: '...', icon: Zap },
            { title: "...", value: '...', icon: Users },
            { title: "...", value: '...', icon: Clock },
            { title: "...", value: '...', icon: Briefcase },
        ];
    }
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (role) {
        case 'moderator':
            const myClients = clients.filter(c => c.registeredBy === userId);
            return [
                { title: "عملاء اليوم", value: myClients.filter(c => c.registeredAt && new Date(c.registeredAt.seconds * 1000) >= todayStart).length, icon: Zap },
                { title: "العملاء النشطون", value: myClients.filter(c => c.transferStatus === 'active').length, icon: Users },
                { title: "قيد المراجعة", value: myClients.filter(c => c.prStatus === 'pending' || c.prStatus === 'under_review').length, icon: Clock },
                { title: "إجمالي العملاء", value: myClients.length, icon: Briefcase },
            ];
        case 'pr':
             const prClients = clients.filter(c => c.assignedToPR === userId);
             const todayAppointments = prClients.flatMap(c => c.prAppointments || []).filter(a => a.date && new Date(a.date.seconds * 1000) >= todayStart && new Date(a.date.seconds * 1000) < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000));
            return [
                { title: "مهام اليوم", value: todayAppointments.length, icon: Clock },
                { title: "عملاء قيد التنفيذ", value: prClients.filter(c => c.prStatus === 'in_progress').length, icon: Zap },
                { title: "عملاء معتمدون", value: prClients.filter(c => c.transferStatus === 'approved').length, icon: CheckCircle },
                { title: "إجمالي العملاء", value: prClients.length, icon: Briefcase },
            ];
        default:
            const assignedClients = clients.filter(c => (role === 'market_researcher' && c.serviceRequests?.marketResearch) || (role === 'creative' && c.serviceRequests?.creative) || (role === 'content' && c.serviceRequests?.content) );
            const statusKey = `${role.split('_')[0]}Status` as keyof Client;
            return [
                { title: "المهام المعلقة", value: assignedClients.filter(c => c[statusKey] === 'pending' || c[statusKey] === 'in_progress').length, icon: Clock },
                { title: "المهام المكتملة", value: assignedClients.filter(c => c[statusKey] === 'completed').length, icon: CheckCircle },
                { title: "إجمالي المهام", value: assignedClients.length, icon: Briefcase },
                { title: "متوسط وقت الإنجاز", value: "3 أيام", icon: BarChart },
            ];
    }
}

export default function DashboardPage() {
    const { user, role } = useAuthStore();
    const firestore = useFirestore();

    const clientsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'clients'));
    }, [firestore]);

    const { data: clients, isLoading } = useCollection<Client>(clientsQuery);

    if (!user || !role) return null;

    const stats = getStatsForRole(role, user.uid, clients);
    
    const recentClients = clients
        ? [...clients]
            .filter(c => role === 'moderator' && c.registeredBy === user.uid)
            .sort((a, b) => (b.registeredAt?.seconds || 0) - (a.registeredAt?.seconds || 0))
            .slice(0, 5)
        : [];

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">مرحباً, {user.displayName || user.email}!</h1>
                <p className="text-muted-foreground">هنا نظرة سريعة على أنشطتك اليوم.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? Array(4).fill(0).map((_, i) => <StatCard key={i} title="..." value="..." icon={Loader2} />) : stats.map((stat, index) => (
                    <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
                ))}
            </div>

            {role === 'moderator' && (
                <div>
                    <h2 className="text-2xl font-headline font-bold mb-4">أحدث العملاء</h2>
                     {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <ClientList isPaginated={false} />
                    )}
                </div>
            )}
        </div>
    );
}
