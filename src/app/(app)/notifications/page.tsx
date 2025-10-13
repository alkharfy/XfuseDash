"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/hooks/use-auth";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc, query, where, updateDoc } from "firebase/firestore";
import type { Notification } from "@/lib/types";
import { Bell, Check, Clock, UserPlus, CheckCircle, FileWarning } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'status_change':
      return <FileWarning className="h-5 w-5" />;
    case 'new_client':
      return <UserPlus className="h-5 w-5" />;
    case 'agreement_approved':
      return <CheckCircle className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

export default function NotificationsPage() {
    const { user } = useAuthStore();
    const firestore = useFirestore();
    const { toast } = useToast();

    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'notifications'), where('userId', '==', user.uid));
    }, [firestore, user]);

    const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

    const markAsRead = async (notificationId: string) => {
        if (!firestore) return;
        const notifRef = doc(firestore, 'notifications', notificationId);
        try {
            await updateDoc(notifRef, { read: true });
            toast({ title: "تم التحديث", description: "تم تحديد الإشعار كمقروء." });
        } catch (error) {
            toast({ variant: "destructive", title: "خطأ", description: "لم يتم تحديث الإشعار." });
        }
    };

    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-3xl font-headline font-bold">الإشعارات</h1>
                    <p className="text-muted-foreground">آخر التحديثات والتنبيهات الخاصة بك.</p>
                  </div>
                  {unreadCount > 0 && <span className="bg-primary text-primary-foreground text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">{unreadCount}</span>}
                </div>
                <Separator/>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>جميع الإشعارات</CardTitle>
                    <CardDescription>هنا قائمة بجميع الإشعارات، الجديدة والقديمة.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[65vh]">
                      <div className="divide-y">
                          {notifications && notifications.length > 0 ? (
                            notifications
                              .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
                              .map(notification => (
                              <div key={notification.id} className={cn("flex items-start gap-4 p-4", !notification.read && "bg-primary/5")}>
                                  <div className={cn("rounded-full p-2 mt-1", notification.read ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground")}>
                                      {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="grid gap-1 flex-1">
                                      <p className={cn("text-sm", !notification.read && "font-semibold")}>
                                          {notification.relatedClientId ? (
                                              <Link href={`/clients/${notification.relatedClientId}`} className="hover:underline">{notification.message}</Link>
                                          ) : (
                                              notification.message
                                          )}
                                      </p>
                                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                                          <Clock className="h-3 w-3" />
                                          {formatTimestamp(notification.createdAt)}
                                      </p>
                                  </div>
                                  {!notification.read && (
                                      <Button
                                          size="sm" 
                                          variant="ghost"
                                          title="وضع علامة كمقروء"
                                          onClick={() => markAsRead(notification.id)}
                                          className="p-2 rounded-full hover:bg-green-100 transition-colors gap-1"
                                      >
                                          <Check className="h-4 w-4 text-green-600"/>
                                          <span className="text-xs text-green-700">مقروء</span>
                                      </Button>
                                  )}
                              </div>
                          ))
                          ) : (
                              <p className="p-8 text-center text-muted-foreground">لا توجد إشعارات جديدة.</p>
                          )}
                      </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
