import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ban } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <Ban className="h-24 w-24 text-destructive mb-4" />
      <h1 className="text-4xl font-bold font-headline">وصول غير مصرح به</h1>
      <p className="text-muted-foreground mt-2">
        ليس لديك الصلاحيات اللازمة لعرض هذه الصفحة.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">العودة إلى لوحة التحكم</Link>
      </Button>
    </div>
  );
}
