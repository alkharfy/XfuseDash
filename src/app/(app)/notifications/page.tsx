"use client";

import { useState } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import { mockNotifications as initialMockNotifications } from "@/lib/data";
import { Bell, Check, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/utils";
import type { Notification } from "@/lib/types";

export default function NotificationsPage() {
    const { user } = useAuthStore();
    
    const [notifications, setNotifications] = useState<Notification[]>(
        user ? initialMockNotifications.filter(n => n.userId === user.uid) : []
    );

    if (!user) return null;

    const markAsRead = (notificationId: string) => {
        setNotifications(currentNotifications => 
            currentNotifications.map(n => 
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-headline font-bold">الإشعارات</h1>
                <p className="text-muted-foreground">آخر التحديثات والتنبيهات الخاصة بك.</p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>جميع الإشعارات</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {notifications.length > 0 ? notifications.map(notification => (
                            <div key={notification.id} className={cn("flex items-start gap-4 p-4", !notification.read && "bg-primary/5")}>
                                <div className={cn("rounded-full p-2 mt-1", notification.read ? "bg-muted" : "bg-accent")}>
                                    <Bell className={cn("h-5 w-5", notification.read ? "text-muted-foreground" : "text-accent-foreground")} />
                                </div>
                                <div className="grid gap-1 flex-1">
                                    <p className="text-sm font-medium">{notification.message}</p>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        {formatTimestamp(notification.createdAt)}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <button 
                                        title="وضع علامة كمقروء"
                                        onClick={() => markAsRead(notification.id)}
                                        className="p-2 rounded-full hover:bg-green-100 transition-colors"
                                    >
                                        <Check className="h-5 w-5 text-green-600"/>
                                        <span className="sr-only">Mark as read</span>
                                    </button>
                                )}
                            </div>
                        )) : (
                            <p className="p-8 text-center text-muted-foreground">لا توجد إشعارات جديدة.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
