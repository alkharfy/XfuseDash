"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ClientHeader } from "@/components/clients/details/client-header";
import { PRSection } from "@/components/clients/details/pr-section";
import { MarketResearchSection } from "@/components/clients/details/market-research-section";
import { CreativeSection } from "@/components/clients/details/creative-section";
import { ContentSection } from "@/components/clients/details/content-section";
import { AgreementSection } from "@/components/clients/details/agreement-section";
import { useAuthStore } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import type { Client } from "@/lib/types";
import { CheckCircle2, Clipboard, Copy, FileText, Home, Loader2, Share2, UserCircle2 } from "lucide-react";

export default function ClientDetailPage() {
  const params = useParams();
  const { id } = params as { id?: string };
  const { role } = useAuthStore();
  const firestore = useFirestore();

  const clientRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, "clients", id as string);
  }, [firestore, id]);

  const { data: client, isLoading } = useDoc<Client>(clientRef);

  // --- helpers (UI only) ---
  const statusVariant = (s?: string) => {
    switch (s) {
      case "completed":
      case "approved":
        return "default" as const;
      case "in_progress":
      case "pending":
        return "secondary" as const;
      case "rejected":
      case "blocked":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // no-op UI helper
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-12">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>جاري التحميل…</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return <div className="text-center p-8">لم يتم العثور على العميل.</div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Breadcrumbs + Role banner */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="text-sm text-muted-foreground flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="h-4 w-4" /> الرئيسية
            </Link>
            <span>/</span>
            <Link href="/clients" className="hover:text-foreground">العملاء</Link>
            <span>/</span>
            <span className="text-foreground">{client?.basicInfo?.name || client?.name || "عميل"}</span>
          </nav>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-2xl px-3 py-1">
              <UserCircle2 className="ms-1 h-4 w-4 inline" /> الدور الحالي: <span className="ms-1 font-medium">{role || "غير محدد"}</span>
            </Badge>
            {client?.creativeStatus && (
              <Badge variant={statusVariant(client.creativeStatus)} className="rounded-2xl px-3 py-1">
                الحالة الإبداعية: {client.creativeStatus}
              </Badge>
            )}
            {client?.transferStatus && (
              <Badge variant={statusVariant(client.transferStatus)} className="rounded-2xl px-3 py-1">
                حالة التحويل: {client.transferStatus}
              </Badge>
            )}
          </div>
        </div>

        <Separator />
      </div>

      {/* Original header */}
      <ClientHeader client={client} />

      {/* Quick actions */}
      <Card className="border-dashed">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(window?.location?.href)}>
                    <Share2 className="ms-1 h-4 w-4" /> نسخ رابط الصفحة
                  </Button>
                </TooltipTrigger>
                <TooltipContent>نسخ رابط تفاصيل العميل للمشاركة</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" size="sm" onClick={() => copyToClipboard(client?.phone)}>
              <Copy className="ms-1 h-4 w-4" /> نسخ رقم الهاتف
            </Button>

            <Button variant="outline" size="sm" onClick={() => copyToClipboard(String(id))}>
              <Clipboard className="ms-1 h-4 w-4" /> نسخ معرف العميل
            </Button>

            {client?.transferStatus === "approved" && (
              <Button size="sm" asChild>
                <Link href={`#agreement`}>
                  <FileText className="ms-1 h-4 w-4" /> الانتقال إلى الاتفاقية
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs wrapper (UI only, does not change data flow) */}
          <Tabs defaultValue="sections" className="w-full">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
              <TabsTrigger value="sections">الأقسام</TabsTrigger>
              <TabsTrigger value="notes">ملاحظات</TabsTrigger>
              <TabsTrigger value="requests">الطلبات</TabsTrigger>
              <TabsTrigger value="timeline">الزمنية</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="space-y-6 mt-4">
              {/* PR Section */}
              {(role === "pr" || role === "moderator") && <PRSection client={client} />}

              {/* Market Research Section */}
              {client.serviceRequests?.marketResearch && (role === "market_researcher" || role === "moderator" || role === "creative" || role === "content") && (
                <MarketResearchSection client={client} />
              )}

              {/* Creative Section */}
              {client.serviceRequests?.creative && (role === "creative" || role === "moderator" || role === "content") && <CreativeSection client={client} />}

              {/* Content Section */}
              {client.serviceRequests?.content && client.creativeStatus === "completed" && (role === "content" || role === "moderator") && (
                <ContentSection client={client} />
              )}
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>ملاحظات عامة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    هذا تبويب عرضي لإضافة أي ملاحظات داخلية لاحقًا (عرض واجهي فقط – لا يؤثر على البيانات).
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>الخدمات المطلوبة</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 text-sm">
                  {client?.serviceRequests ? (
                    Object.entries(client.serviceRequests).map(([k, v]) => (
                      <Badge key={k} variant={v ? "default" : "outline"} className="rounded-2xl px-3 py-1">
                        {k}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">لا توجد بيانات خدمة.</span>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>الخط الزمني</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-56 pe-2">
                    <ul className="space-y-3 text-sm">
                      {client?.createdAt && (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5" />
                          <span>تم إنشاء السجل: {String((client as any).createdAt)}</span>
                        </li>
                      )}
                      {client?.updatedAt && (
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 mt-0.5" />
                          <span>آخر تحديث: {String((client as any).updatedAt)}</span>
                        </li>
                      )}
                      <li className="text-muted-foreground">عناصر Placeholder — يمكن ربطها لاحقًا بمصدر أحداث فعلي.</li>
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6 lg:col-span-1">
          {/* Existing basic info card (unchanged) */}
          {client.basicInfo && (
            <Card>
              <CardHeader>
                <CardTitle>المعلومات الأساسية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>الهاتف:</strong> {client.phone}
                </p>
                {client.basicInfo.email && (
                  <p>
                    <strong>الإيميل:</strong> {client.basicInfo.email}
                  </p>
                )}
                {client.basicInfo.address && (
                  <p>
                    <strong>العنوان:</strong> {client.basicInfo.address}
                  </p>
                )}
                {client.basicInfo.notes && (
                  <p>
                    <strong>ملاحظات:</strong> {client.basicInfo.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* New: compact status & meta card */}
          <Card>
            <CardHeader>
              <CardTitle>نظرة سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-2xl px-3 py-1">ID: {String(id)}</Badge>
                {client?.creativeStatus && (
                  <Badge variant={statusVariant(client.creativeStatus)} className="rounded-2xl px-3 py-1">{client.creativeStatus}</Badge>
                )}
                {client?.transferStatus && (
                  <Badge variant={statusVariant(client.transferStatus)} className="rounded-2xl px-3 py-1">{client.transferStatus}</Badge>
                )}
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="flex items-center justify-between"><span className="text-muted-foreground">تاريخ الإنشاء</span><span>{client?.createdAt ? String((client as any).createdAt) : "—"}</span></div>
                <div className="flex items-center justify-between"><span className="text-muted-foreground">آخر تحديث</span><span>{client?.updatedAt ? String((client as any).updatedAt) : "—"}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agreement section (original condition) */}
      <div id="agreement">
        {client.transferStatus === "approved" && <AgreementSection client={client} />}
      </div>
    </div>
  );
}
