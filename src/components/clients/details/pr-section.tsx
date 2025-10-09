"use client";

import { Client } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, MoreVertical, PlusCircle, X } from "lucide-react";
import { formatTimestamp } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { ApproveClientDialog } from "./approve-client-dialog";
import { AddAppointmentDialog } from "./add-appointment-dialog";

export function PRSection({ client }: { client: Client }) {
    const firestore = useFirestore();

    const clientRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'clients', client.id);
    }, [firestore, client.id]);

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


    return (
        <Card>
            <CardHeader>
                <CardTitle>قسم العلاقات العامة (PR)</CardTitle>
                <CardDescription>إدارة حالة العميل، المواعيد، وعمليات التحويل.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
