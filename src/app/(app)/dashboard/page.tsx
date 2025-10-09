"use client";

import { useAuth } from "@/hooks/use-auth";
import StatCard from "@/components/dashboard/stat-card";
import { mockClients } from "@/lib/data";
import { Client, UserRole } from "@/lib/types";
import { BarChart, Briefcase, CheckCircle, Clock, Users, Zap } from "lucide-react";
import ClientList from "@/components/clients/client-list";

const getStatsForRole = (role: UserRole, userId: string, clients: Client[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (role) {
        case 'moderator':
            const myClients = clients.filter(c => c.registeredBy === userId);
            return [
                { title: "عملاء اليوم", value: myClients.filter(c => new Date(c.registeredAt.seconds * 1000) >= todayStart).length, icon: Zap },
                { title: "العملاء النشطون", value: myClients.filter(c => c.transferStatus === 'active').length, icon: Users },
                { title: "قيد المراجعة", value: myClients.filter(c => c.prStatus === 'pending' || c.prStatus === 'under_review').length, icon: Clock },
                { title: "إجمالي العملاء", value: myClients.length, icon: Briefcase },
            ];
        case 'pr':
             const prClients = clients.filter(c => c.assignedToPR === userId);
             const todayAppointments = prClients.flatMap(c => c.prAppointments || []).filter(a => new Date(a.date.seconds * 1000) >= todayStart && new Date(a.date.seconds * 1000) < new Date(todayStart.getTime() + 24 * 60 * 60 * 1000));
            return [
                { title: "مهام اليوم", value: todayAppointments.length, icon: Clock },
                { title: "عملاء قيد التنفيذ", value: prClients.filter(c => c.prStatus === 'in_progress').length, icon: Zap },
                { title: "عملاء معتمدون", value: prClients.filter(c => c.transferStatus === 'approved').length, icon: CheckCircle },
                { title: "إجمالي العملاء", value: prClients.length, icon: Briefcase },
            ];
        default:
            const assignedClients = clients.filter(c => (role === 'market_researcher' && c.serviceRequests.marketResearch) || (role === 'creative' && c.serviceRequests.creative) || (role === 'content' && c.serviceRequests.content) );
            return [
                { title: "المهام المعلقة", value: assignedClients.filter(c => c[`${role.split('_')[0]}Status`] === 'pending' || c[`${role.split('_')[0]}Status`] === 'in_progress').length, icon: Clock },
                { title: "المهام المكتملة", value: assignedClients.filter(c => c[`${role.split('_')[0]}Status`] === 'completed').length, icon: CheckCircle },
                { title: "إجمالي المهام", value: assignedClients.length, icon: Briefcase },
                { title: "متوسط وقت الإنجاز", value: "3 أيام", icon: BarChart },
            ];
    }
}

export default function DashboardPage() {
    const { user, role } = useAuth();

    if (!user || !role) return null;

    const stats = getStatsForRole(role, user.uid, mockClients);
    const recentClients = mockClients
        .filter(c => c.registeredBy === user.uid)
        .sort((a, b) => b.registeredAt.seconds - a.registeredAt.seconds)
        .slice(0, 5);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">مرحباً, {user.name}!</h1>
                <p className="text-muted-foreground">هنا نظرة سريعة على أنشطتك اليوم.</p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <StatCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
                ))}
            </div>

            {role === 'moderator' && (
                <div>
                    <h2 className="text-2xl font-headline font-bold mb-4">أحدث العملاء</h2>
                    <ClientList clients={recentClients} isPaginated={false} />
                </div>
            )}
        </div>
    );
}
