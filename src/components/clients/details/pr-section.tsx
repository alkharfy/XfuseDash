"use client";

import { Client, User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, MoreVertical, PlusCircle, UserCircle, X } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useMemoFirebase, useCollection } from "@/firebase";
import { collection, doc, query, where } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ApproveClientDialog } from "./approve-client-dialog";
import { AddAppointmentDialog } from "./add-appointment-dialog";

export function PRSection({ client }: { client: Client }) {
    const firestore = useFirestore();

    const clientRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'clients', client.id);
    }, [firestore, client.id]);

    // Fetch all users with 'creative' role
    const creativesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "users"), where("role", "==", "creative"));
    }, [firestore]);

    const { data: creativeUsers } = useCollection<User>(creativesQuery);

    const handleStatusChange = (status: string) => {
        if (clientRef) {
            updateDocumentNonBlocking(clientRef, { prStatus: status });
        }
    };
    
    const handleTransferStatusChange = (status: string) => {
        if(clientRef) {
            updateDocumentNonBlocking(clientRef, { transferStatus: status });
        }
    }

    const handleAssignCreative = (userId: string) => {
        if (clientRef) {
            updateDocumentNonBlocking(clientRef, { assignedCreative: userId });
        }
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>قسم العلاقات العامة (PR)</CardTitle>
                <CardDescription>إدارة حالة العميل، المواعيد، وعمليات التحويل.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Assigned Creative Selector */}
                <div className="flex items-center gap-3">
                    <UserCircle className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">الكاتب الإبداعي المعين</label>
                        <Select
                            value={client.assignedCreative || ""}
                            onValueChange={handleAssignCreative}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="اختر الكاتب الإبداعي" />
                            </SelectTrigger>
                            <SelectContent>
                                {creativeUsers?.map((user) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p><strong>حالة PR:</strong> {client.prStatus || 'pending'}</p>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline">تغيير الحالة</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>تغيير حالة العميل</DialogTitle>
                                <DialogDescription>اختر الحالة الجديدة للعميل في قسم العلاقات العامة.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <Select defaultValue={client.prStatus} onValueChange={handleStatusChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="اختر الحالة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">معلق</SelectItem>
                                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                                        <SelectItem value="under_review">قيد المراجعة</SelectItem>
                                        <SelectItem value="completed">مكتمل</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">المواعيد</h4>
                        <AddAppointmentDialog client={client}>
                             <Button variant="outline" size="sm">
                                <PlusCircle className="ms-2 h-4 w-4" />
                                إضافة موعد
                            </Button>
                        </AddAppointmentDialog>
                    </div>
                    <div className="space-y-2">
                        {client.prAppointments?.length ? client.prAppointments.map((appt, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatTimestamp(appt.date)} @ {appt.time}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${appt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : appt.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {appt.status === 'scheduled' ? 'مجدول' : appt.status === 'completed' ? 'مكتمل' : 'ملغي'}
                                    </span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6"><MoreVertical className="h-4 w-4"/></Button>
                                </div>
                            </div>
                        )) : <p className="text-sm text-muted-foreground">لا توجد مواعيد مجدولة.</p>}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <p><strong>حالة التحويل:</strong> {client.transferStatus || 'active'}</p>
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={() => handleTransferStatusChange('bad_client')}><X className="ms-2 h-4 w-4"/>عميل سيء</Button>
                        <ApproveClientDialog client={client}>
                            <Button><Check className="ms-2 h-4 w-4"/>موافقة وتحويل</Button>
                        </ApproveClientDialog>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
