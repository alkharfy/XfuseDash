"use client";

import { useState } from "react";
import { Client } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { AddIdeaDialog } from "./add-idea-dialog";

export function CreativeSection({ client }: { client: Client }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    
    const calendarEntries = client.contentCalendar || [];

    const ideasForSelectedDate = date 
        ? calendarEntries.filter(entry => new Date(entry.date.seconds * 1000).toDateString() === date.toDateString())
        : [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>قسم الإبداع</CardTitle>
                <CardDescription>إدارة تقويم المحتوى وجدولة الأفكار الإبداعية.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                        locale={ar}
                    />
                </div>
                <div className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">
                            الأفكار لـ: {date ? format(date, 'PPP', { locale: ar }) : ''}
                        </h4>
                        <div className="space-y-2">
                            {ideasForSelectedDate.length > 0 ? (
                                ideasForSelectedDate.map((idea, index) => (
                                    <div key={index} className="p-2 border rounded-md text-sm">
                                        <p>{idea.idea}</p>
                                        <p className="text-xs text-muted-foreground">الحالة: {idea.status}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">لا توجد أفكار لهذا اليوم.</p>
                            )}
                        </div>
                    </div>
                     <AddIdeaDialog client={client} selectedDate={date}>
                        <Button>إضافة فكرة جديدة</Button>
                    </AddIdeaDialog>
                </div>
            </CardContent>
        </Card>
    );
}
