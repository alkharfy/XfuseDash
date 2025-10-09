import { Client } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { formatShortDate } from "@/lib/utils";
import { mockUsers } from "@/lib/data";

export function ContentSection({ client }: { client: Client }) {
    const contentTasks = client.contentTasks || [];
    
    const getUserName = (userId: string) => {
        return mockUsers.find(u => u.uid === userId)?.name || "غير معروف";
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>قسم المحتوى</CardTitle>
                <CardDescription>تتبع مهام إنشاء المحتوى وتحديث حالاتها.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {contentTasks.length > 0 ? (
                    contentTasks.map((task, index) => (
                        <div key={index} className="flex items-start space-x-3 space-x-reverse">
                            <Checkbox id={`task-${index}`} checked={task.status === 'completed'} />
                            <div className="grid gap-1.5 leading-none">
                                <label
                                    htmlFor={`task-${index}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {task.title}
                                </label>
                                <p className="text-sm text-muted-foreground">
                                    تاريخ التسليم: {formatShortDate(task.dueDate)} | معين لـ: {getUserName(task.assignedTo)}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">لا توجد مهام محتوى حالياً.</p>
                )}
            </CardContent>
        </Card>
    );
}
