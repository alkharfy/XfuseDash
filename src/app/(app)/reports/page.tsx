
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold">التقارير</h1>
        <p className="text-muted-foreground">عرض تحليلات ورؤى حول أداء الفريق والعملاء.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>مركز التقارير</CardTitle>
          <CardDescription>هذه الصفحة قيد التطوير حالياً.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center pt-10 text-center min-h-[300px]">
            <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
                سيتم عرض الرسوم البيانية والتحليلات المفصلة هنا قريباً.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
