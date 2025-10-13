
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, FileText, Activity, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ReportsPage() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-3xl font-headline font-bold">التقارير والتحليلات</h1>
          <p className="text-muted-foreground">عرض تحليلات ورؤى حول أداء الفريق والعملاء.</p>
        </div>
        <Separator/>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="text-primary"/>
            مركز التقارير
          </CardTitle>
          <CardDescription>هذه الصفحة قيد التطوير حالياً، وستحتوي على تحليلات تفصيلية لأداء مهامك.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-10 text-center min-h-[300px] bg-muted/30 rounded-b-lg">
            <div className="flex items-center justify-center p-6 rounded-full bg-primary/10 mb-4">
              <BarChart className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">قريبًا: لوحة تحكم تحليلية متكاملة</h3>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                سيتم عرض الرسوم البيانية والتحليلات المفصلة هنا قريبًا لمساعدتك في تتبع الأداء واتخاذ قرارات أفضل.
            </p>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Users className="text-primary"/> تقارير العملاء</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">تحليل مصادر العملاء، ومعدلات التحويل، وأكثر.</p></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Activity className="text-primary"/> تقارير الأداء</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">قياس أداء الحملات والمنشورات الإبداعية.</p></CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><FileText className="text-primary"/> تقارير المهام</CardTitle>
          </CardHeader>
          <CardContent><p className="text-sm text-muted-foreground">تتبع وقت إنجاز المهام وأداء الفريق.</p></CardContent>
        </Card>
      </div>

    </div>
  );
}
