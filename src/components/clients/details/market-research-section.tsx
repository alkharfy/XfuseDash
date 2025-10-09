"use client";

import { useState, useTransition } from "react";
import { Client } from "@/lib/types";
import { getSummaryForResearchFile } from "@/app/actions";
import { useAuthStore } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Loader2, Sparkles, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { MarketResearchFileCategory } from "@/lib/types";

const categoryTranslations: Record<MarketResearchFileCategory, string> = {
    creative: "كريتيف",
    copywriter: "كوبي رايتر",
    media_buyer: "ميديا باير",
    manager: "مدير",
    client: "عميل",
};

const FileUploadArea = ({ category, label }: { category: MarketResearchFileCategory, label: string }) => (
    <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
        <h4 className="font-semibold">ملف موجه لـ {label}</h4>
        <Input type="file" className="hidden" id={`file-upload-${category}`}/>
        <Button asChild variant="outline" size="sm">
            <label htmlFor={`file-upload-${category}`}>تصفح الملفات</label>
        </Button>
    </div>
);


export function MarketResearchSection({ client }: { client: Client }) {
    const { role } = useAuthStore();
    const [summary, setSummary] = useState(client.marketResearchSummary || "");
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    
    const handleSummarize = (fileName: string) => {
        startTransition(async () => {
            const result = await getSummaryForResearchFile(fileName, client.id);
            if (result.summary) {
                setSummary(result.summary);
                toast({ title: "نجاح", description: "تم تلخيص الملف بنجاح." });
            } else {
                toast({ variant: "destructive", title: "خطأ", description: result.error });
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>قسم أبحاث السوق</CardTitle>
                <CardDescription>رفع ملفات البحث وتوليد ملخصات تلقائية.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {(role === 'market_researcher' || role === 'moderator') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FileUploadArea category="creative" label="الكريتفز" />
                        <FileUploadArea category="copywriter" label="الكوبي رايتر" />
                        <FileUploadArea category="media_buyer" label="الميديا باير" />
                        <FileUploadArea category="manager" label="المدير" />
                        <FileUploadArea category="client" label="العميل" />
                    </div>
                )}

                <div>
                    <h4 className="font-semibold mb-2">الملفات المرفوعة</h4>
                    <div className="space-y-2">
                        {client.marketResearchFiles?.length ? client.marketResearchFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md border">
                                <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-muted-foreground" />
                                    <span>{file.fileName}</span>
                                    {file.category && <span className="text-xs text-muted-foreground">({categoryTranslations[file.category] || file.category})</span>}
                                </div>
                                {(role === 'market_researcher' || role === 'moderator') && (
                                    <Button size="sm" onClick={() => handleSummarize(file.fileName)} disabled={isPending}>
                                        {isPending ? <Loader2 className="ms-2 h-4 w-4 animate-spin"/> : <Sparkles className="ms-2 h-4 w-4"/>}
                                        تلخيص
                                    </Button>
                                )}
                            </div>
                        )) : <p className="text-sm text-muted-foreground">لا توجد ملفات مرفوعة.</p>}
                    </div>
                </div>

                {summary && (
                    <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary"/> ملخص البحث</h4>
                        <p className="text-sm bg-primary/5 p-4 rounded-md border border-primary/20 leading-relaxed">{summary}</p>
                    </div>
                )}

                 {isPending && (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">جاري تحليل الملف وتوليد الملخص...</p>
                        <Progress value={50} className="w-full" />
                    </div>
                 )}
            </CardContent>
        </Card>
    );
}
