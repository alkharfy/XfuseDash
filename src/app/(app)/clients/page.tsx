"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuthStore } from "@/hooks/use-auth";
import ClientList from "@/components/clients/client-list";
import { AddClientDialog } from "@/components/clients/add-client-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Users, PlusCircle, Search, Filter, Download, RefreshCw, Settings2 } from "lucide-react";

export default function ClientsPage() {
  // نحتفظ بنفس طريقة القراءة غير التفاعلية كما في الملف الأصلي
  const role = useAuthStore.getState()?.role as string | undefined;
  const canCreate = role === "admin" || role === "moderator";

  // UI فقط: نص مساعد حسب الدور
  const roleLabel = useMemo(() => {
    switch (role) {
      case "admin":
        return "مدير النظام";
      case "moderator":
        return "مشرف";
      case "pr":
        return "علاقات عامة";
      case "creative":
        return "كرييتف";
      case "content":
        return "محتوى";
      case "market_researcher":
        return "باحث سوق";
      default:
        return role || "غير محدد";
    }
  }, [role]);

  return (
    <div className="space-y-6 p-2 sm:p-4 lg:p-6" dir="rtl">
      {/* مسار تنقّل + شارات */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="text-sm text-muted-foreground flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="h-4 w-4" /> الرئيسية
            </Link>
            <span>/</span>
            <span className="text-foreground">العملاء</span>
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-2xl px-3 py-1">الدور: {roleLabel}</Badge>
            <Badge className="rounded-2xl px-3 py-1">XFUSE</Badge>
          </div>
        </div>
        <Separator />
      </div>

      {/* هيدر أنيق متوافق مع شركة XFUSE */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="bg-gradient-to-l from-fuchsia-500/10 via-purple-500/10 to-pink-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
              <Users className="h-6 w-6" /> إدارة العملاء — XFUSE
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              لوحة مركزية لفِرق التسويق في Xfuse لإدارة العملاء، المتابعة، وتنسيق مهام PR/Creative/Content/Research.
            </p>
          </CardHeader>
        </div>
        <CardContent className="pt-4">
          {/* شريط أدوات أعلى القائمة (واجهات فقط) */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالاسم أو الهاتف… (واجهة فقط)"
                  className="pe-9"
                  // واجهة فقط — بدون منطق فلترة حتى لا نغير الباك إند أو تدفق البيانات
                  onChange={() => {}}
                />
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" /> فلاتر
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>فلاتر عرض (واجهة فقط)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <RefreshCw className="h-4 w-4" /> تحديث
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>تحديث العرض (واجهة فقط)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="h-4 w-4" /> تصدير CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>تصدير العملاء الظاهرين (واجهة فقط)</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="ms-auto" />

              {canCreate && (
                <AddClientDialog>
                  <Button size="sm" className="gap-1">
                    <PlusCircle className="h-4 w-4" /> إضافة عميل
                  </Button>
                </AddClientDialog>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="rounded-2xl px-2 py-0.5">القسم: تسويق إلكتروني</Badge>
              <Badge variant="outline" className="rounded-2xl px-2 py-0.5">علامة: Xfuse</Badge>
              <Badge variant="outline" className="rounded-2xl px-2 py-0.5">واجهة فقط</Badge>
              <div className="ms-auto flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                <span>تخصيص العرض لاحقًا (UI Only)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة العملاء كما هي */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">قائمة العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          {/* لا نغيّر منطق الجلب أو العرض داخل ClientList */}
          <ScrollArea className="h-[60vh] pe-2">
            <ClientList />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
