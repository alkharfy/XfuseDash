"use client";

import { useState } from "react";
import { Client, CalendarEntry } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { IdeaDialog } from "./idea-dialog";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const approvalStatusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    draft: "outline",
    review: "secondary",
    with_client: "secondary",
    approved: "default",
    rejected: "destructive",
    scheduled: "outline", // For legacy
};

const approvalStatusTranslation: { [key: string]: string } = {
    draft: "مسودة",
    review: "للمراجعة",
    with_client: "مع العميل",
    approved: "معتمد",
    rejected: "مرفوض",
    scheduled: "مجدولة", // For legacy
    in_progress: "قيد التنفيذ", // For legacy
    completed: "مكتملة", // For legacy
    cancelled: "ملغاة" // For legacy
};

export function CreativeSection({ client }: { client: Client }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedIdea, setSelectedIdea] = useState<CalendarEntry | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const calendarEntries = client.contentCalendar || [];

    const ideasForSelectedDate = date 
        ? calendarEntries.filter(entry => entry.date && new Date(entry.date.seconds * 1000).toDateString() === date.toDateString())
        : [];
    
    const handleAddIdea = () => {
        setSelectedIdea(null);
        setIsDialogOpen(true);
    }

    const handleEditIdea = (idea: CalendarEntry) => {
        setSelectedIdea(idea);
        setIsDialogOpen(true);
    }

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
                    <div className="flex justify-between items-center">
                        <h4 className="font-semibold">
                            الأفكار لـ: {date ? format(date, 'PPP', { locale: ar }) : ''}
                        </h4>
                        <Button onClick={handleAddIdea} size="sm">
                            <PlusCircle className="ms-2 h-4 w-4" />
                            إضافة فكرة
                        </Button>
                    </div>
                    <div className="space-y-2">
                        {ideasForSelectedDate.length > 0 ? (
                            ideasForSelectedDate.map((idea, index) => (
                                <div key={idea.id || index}>
                                    <button onClick={() => handleEditIdea(idea)} className="w-full text-right p-3 border rounded-md text-sm hover:bg-muted transition-colors">
                                        <div className="flex justify-between items-center">
                                           <p className="font-medium">{idea.title || idea.idea}</p>
                                           <Badge variant={approvalStatusVariantMap[idea.approvalStatus || idea.status || 'draft'] || 'outline'}>
                                                {approvalStatusTranslation[idea.approvalStatus || idea.status || 'draft']}
                                           </Badge>
                                        </div>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-center text-muted-foreground pt-4">لا توجد أفكار لهذا اليوم.</p>
                        )}
                    </div>
                </div>
            </CardContent>

            <IdeaDialog
                isOpen={isDialogOpen}
                setIsOpen={setIsDialogOpen}
                client={client}
                selectedDate={date}
                idea={selectedIdea}
            />
        </Card>
    );
}
