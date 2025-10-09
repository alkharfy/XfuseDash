

"use client";

import { useState } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import { Client, UserRole } from "@/lib/types";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, PlusCircle, Search } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/export";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getTabsForRole } from "@/lib/roles";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { AddClientDialog } from "./add-client-dialog";

const filterClients = (clients: Client[], role: UserRole, userId: string, tab: string, searchTerm: string): Client[] => {
    let filtered = clients;
    
    // Role & Tab based filtering
    switch (role) {
        case 'admin':
             if (tab === 'active') {
                filtered = clients.filter(c => c.transferStatus === 'active');
            } else if (tab === 'approved') {
                filtered = clients.filter(c => c.transferStatus === 'approved');
            }
            break;
        case 'moderator':
            if (tab === 'my-clients') {
                filtered = clients.filter(c => c.registeredBy === userId);
            } else {
                 filtered = clients;
            }
            break;
        case 'pr':
            filtered = clients.filter(c => c.assignedToPR === userId);
            if (tab === 'approved') {
                filtered = filtered.filter(c => c.transferStatus === 'approved');
            } else if (tab === 'bad-clients') {
                filtered = filtered.filter(c => c.transferStatus === 'bad_client');
            } else if (tab === 'today-calls') {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);
                
                filtered = filtered.filter(c => 
                    c.prAppointments?.some(a => {
                        const apptDate = new Date(a.date.seconds * 1000);
                        return apptDate >= todayStart && apptDate <= todayEnd && a.status === 'scheduled';
                    })
                );
            } else if (tab === 'not-started') {
                filtered = filtered.filter(c => c.prStatus === 'pending');
            }
            // "my-clients" is the default, no extra filtering needed after assignedToPR
            break;
        case 'market_researcher':
            filtered = clients.filter(c => c.serviceRequests.marketResearch && c.transferStatus === 'approved');
            break;
        case 'creative':
            filtered = clients.filter(c => c.serviceRequests.creative && c.transferStatus === 'approved');
            break;
        case 'content':
            filtered = clients.filter(c => c.serviceRequests.content && c.creativeStatus === 'completed' && c.transferStatus === 'approved');
            break;
    }

    // Search term filtering
    if (searchTerm) {
        const lowercasedTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(client =>
            client.name.toLowerCase().includes(lowercasedTerm) ||
            client.phone.includes(lowercasedTerm) ||
            (client.basicInfo && client.basicInfo.email && client.basicInfo.email.toLowerCase().includes(lowercasedTerm))
        );
    }
    
    return filtered;
};


export default function ClientList({ isPaginated = true }: { isPaginated?: boolean }) {
    const { user, role } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const firestore = useFirestore();

    const [searchTerm, setSearchTerm] = useState("");
    const tabs = role ? getTabsForRole(role) : [];
    
    const activeTab = searchParams.get('tab') || (tabs.length > 0 ? tabs[0].value : '');

    const clientsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'clients');
    }, [firestore]);
    
    const { data: initialClients, isLoading } = useCollection<Client>(clientsQuery);

    if (!user || !role) return null;

    const handleTabChange = (tabValue: string) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', tabValue);
        router.push(`${pathname}?${params.toString()}`);
    };

    const clients = filterClients(initialClients || [], role, user.uid, activeTab, searchTerm);
    
    const handleExport = (format: 'excel' | 'pdf') => {
        if (!clients.length) return;
        const dataToExport = clients.map(c => ({
            الاسم: c.name,
            الهاتف: c.phone,
            الايميل: c.basicInfo?.email || 'N/A',
            الحالة: c.prStatus || 'N/A',
            تاريخ_التسجيل: c.registeredAt ? new Date((c.registeredAt.seconds || 0) * 1000).toLocaleDateString('ar-EG') : 'N/A',
        }));

        if (format === 'excel') {
            exportToExcel(dataToExport, 'clients_report');
        } else {
            exportToPDF(dataToExport, 'clients_report', 'تقرير العملاء');
        }
    }

    return (
        <Card>
            <CardHeader className="flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                 <div className="relative w-full max-w-sm">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="ابحث بالاسم، الهاتف، أو الإيميل..." 
                        className="pr-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    {(role === 'moderator' || role === 'admin') && (
                       <AddClientDialog>
                           <Button className="flex-1 sm:flex-none">
                                <PlusCircle className="ms-2 h-4 w-4" />
                                إضافة عميل
                            </Button>
                       </AddClientDialog>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="flex-1 sm:flex-none">
                                <Download className="ms-2 h-4 w-4" />
                                تصدير
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleExport('excel')}>تصدير Excel</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport('pdf')}>تصدير PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 sm:w-auto sm:inline-flex">
                        {tabs.map(tab => (
                            <TabsTrigger key={tab.value} value={tab.value}>{tab.label}</TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="mt-4">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                           <DataTable columns={columns} data={clients} isPaginated={isPaginated} />
                        )}
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}
