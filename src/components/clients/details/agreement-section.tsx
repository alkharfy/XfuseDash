"use client";

import { Client } from "@/lib/types";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CheckCircle2,
  File,
  Link as LinkIcon,
  Wallet,
  DollarSign,
  CalendarRange,
  Target,
  Clipboard,
  Globe,
  Phone,
  User2,
  Info,
} from "lucide-react";
import { useCallback } from "react";

const DetailItem = ({ label, value }: { label: string; value: any }) => {
  if (!value) return null;
  return (
    <p className="text-sm leading-6">
      <strong className="ms-1">{label}:</strong> {String(value)}
    </p>
  );
};

const leadSourceTranslations: { [key: string]: string } = {
  facebook_ads: "Facebook Ads",
  instagram_ads: "Instagram Ads",
  google_ads: "Google Ads",
  tiktok_ads: "TikTok Ads",
  referral: "إحالة",
  organic: "بحث طبيعي",
  website: "الموقع الإلكتروني",
  event: "فعاليات",
};

const pipelineStageTranslations: { [key: string]: string } = {
  new: "جديد",
  qualified: "مؤهل",
  proposal_sent: "تم إرسال العرض",
  negotiation: "تفاوض",
  won: "مقبول",
  lost: "مرفوض",
  on_hold: "معلق",
};

const mainGoalTranslations: { [key: string]: string } = {
  sales: "زيادة المبيعات",
  bookings: "حجز مواعيد",
  leads: "جمع Leads",
  awareness: "وعي بالعلامة التجارية",
};

export function AgreementSection({ client }: { client: Client }) {
  if (!client.transferStatus || client.transferStatus !== "approved") return null;

  const { finalAgreement, operationalData, leadInfo, scopeOfWork, kpis } = client;

  // UI helper (نسخ للنصوص/الروابط)
  const copy = useCallback(async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }, []);

  return (
    <Card className="col-span-1 lg:col-span-3" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle2 className="text-primary h-5 w-5" />
              ملف العميل الشامل (Onboarding Data)
            </CardTitle>
            <CardDescription>جميع تفاصيل الاتفاق والبيانات التشغيلية للعميل.</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default" className="rounded-2xl px-3 py-1">
              الحالة: {client.transferStatus}
            </Badge>
            {client?.finalAgreement?.startDate && (
              <Badge variant="outline" className="rounded-2xl px-3 py-1">
                <CalendarRange className="h-4 w-4 ms-1 inline" />
                بدء: {formatShortDate(client.finalAgreement.startDate)}
              </Badge>
            )}
          </div>
        </div>

        {/* شريط ملخّص سريع */}
        <div className="mt-3 grid gap-2 rounded-xl border p-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 opacity-70" />
            <span className="text-muted-foreground">الدفعة الأولى:</span>
            <span className="font-medium">
              {finalAgreement?.firstPayment
                ? `${finalAgreement.firstPayment} ${finalAgreement.currency || ""}`
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 opacity-70" />
            <span className="text-muted-foreground">السعر المتفق:</span>
            <span className="font-medium">
              {finalAgreement?.agreedPrice
                ? `${finalAgreement.agreedPrice} ${finalAgreement.currency || ""}`
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 opacity-70" />
            <span className="text-muted-foreground">الهدف الرئيسي:</span>
            <span className="font-medium">
              {kpis?.mainGoal ? mainGoalTranslations[kpis.mainGoal] : "—"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User2 className="h-4 w-4 opacity-70" />
            <span className="text-muted-foreground">جهة بديلة:</span>
            <span className="font-medium">
              {operationalData?.alternativeContactName || "—"}
            </span>
          </div>
        </div>
      </CardHeader>

      <Separator className="my-2" />

      <CardContent className="space-y-4 text-sm">
        <Accordion
          type="multiple"
          defaultValue={["pricing", "scope"]}
          className="w-full"
        >
          {/* 1) التسعير والدفع */}
          {finalAgreement && (
            <AccordionItem value="pricing">
              <AccordionTrigger>1. التسعير والدفع</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailItem
                    label="السعر المتفق عليه"
                    value={`${finalAgreement.agreedPrice || "N/A"} ${
                      finalAgreement.currency || ""
                    }`}
                  />
                  <DetailItem
                    label="الدفعة الأولى"
                    value={`${finalAgreement.firstPayment || "N/A"} ${
                      finalAgreement.currency || ""
                    }`}
                  />
                  <DetailItem
                    label="مدة العقد"
                    value={
                      finalAgreement.duration
                        ? `${finalAgreement.duration} أشهر`
                        : "N/A"
                    }
                  />
                  <DetailItem label="خطة الدفع" value={finalAgreement.paymentPlan} />
                  <DetailItem label="وسيلة الدفع" value={finalAgreement.paymentMethod} />
                  <DetailItem label="تفاصيل التنفيذ" value={finalAgreement.agreementDetails} />
                  <DetailItem
                    label="تاريخ البدء"
                    value={formatShortDate(finalAgreement.startDate)}
                  />
                </div>

                {finalAgreement.paymentScreenshots &&
                  finalAgreement.paymentScreenshots.length > 0 && (
                    <div className="mt-2">
                      <strong>إثباتات الدفع:</strong>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        {finalAgreement.paymentScreenshots.map((file, index) => (
                          <div key={index} className="flex items-center justify-between gap-2 rounded-lg border p-2">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                              <File className="h-4 w-4" />
                              {file.name}
                            </a>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => copy(file.url)}
                                  >
                                    <Clipboard className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>نسخ الرابط</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* 2) نطاق العمل */}
          {scopeOfWork && (
            <AccordionItem value="scope">
              <AccordionTrigger>2. نطاق العمل (Scope)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailItem label="اسم الباقة/الخطة" value={scopeOfWork.packageOrPlanName} />
                  <DetailItem label="الخدمات الدقيقة" value={scopeOfWork.detailedServices} />
                  <DetailItem label="نقاط التميز (USP)" value={scopeOfWork.usp} />
                  <DetailItem label="الخطوط الحمراء (Brand Safety)" value={scopeOfWork.brandSafety} />
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {scopeOfWork.platforms && (
                    <p>
                      <strong>المنصات:</strong>{" "}
                      {scopeOfWork.platforms.join(", ")}
                    </p>
                  )}
                  {scopeOfWork.languages && (
                    <p>
                      <strong>اللغات:</strong>{" "}
                      {scopeOfWork.languages.join(", ")}
                    </p>
                  )}
                  {scopeOfWork.clientMaterials && (
                    <p>
                      <strong>المواد المتاحة:</strong>{" "}
                      {scopeOfWork.clientMaterials.join(", ")}
                    </p>
                  )}
                </div>

                <p>
                  <strong>احتياج تصوير:</strong>{" "}
                  {scopeOfWork.photographyNeeded
                    ? `نعم (${scopeOfWork.photographyDetails || ""})`
                    : "لا"}
                </p>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* 3) الأهداف والمؤشرات */}
          {kpis && (
            <AccordionItem value="kpis">
              <AccordionTrigger>3. الأهداف والمؤشرات (KPIs)</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailItem
                    label="الهدف الرئيسي"
                    value={kpis.mainGoal ? mainGoalTranslations[kpis.mainGoal] : ""}
                  />
                  <DetailItem label="أرقام مستهدفة شهرية" value={kpis.monthlyTargets} />
                  <DetailItem label="متوسط قيمة الطلب (AOV)" value={kpis.aov} />
                  <DetailItem label="الجدول الزمني للهدف" value={kpis.goalTimeline} />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* 4) البيانات التشغيلية */}
          {operationalData && (
            <AccordionItem value="operational-data">
              <AccordionTrigger>4. البيانات التشغيلية</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailItem label="رقم العميل الداخلي" value={operationalData.internalClientId} />
                  <DetailItem
                    label="طريقة التواصل المفضلة"
                    value={operationalData.preferredContactMethod}
                  />
                  <DetailItem label="أفضل وقت للتواصل" value={operationalData.bestContactTime} />
                  <DetailItem label="المنطقة الزمنية" value={operationalData.clientTimezone} />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailItem
                    label="جهة اتصال بديلة"
                    value={operationalData.alternativeContactName}
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 opacity-70" />
                    <span className="text-muted-foreground">رقم بديل:</span>
                    <span className="font-medium">
                      {operationalData.alternativeContactNumber || "—"}
                    </span>
                    {operationalData.alternativeContactNumber && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => copy(operationalData.alternativeContactNumber)}
                            >
                              <Clipboard className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>نسخ الرقم</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* 5) معلومات الـLead */}
          {leadInfo && (
            <AccordionItem value="lead-info">
              <AccordionTrigger>5. معلومات الـLead</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <DetailItem
                    label="مصدر العميل"
                    value={leadInfo.source ? leadSourceTranslations[leadInfo.source] : ""}
                  />
                  <DetailItem label="اسم الحملة" value={leadInfo.campaignName} />
                  <DetailItem
                    label="تاريخ أول تواصل"
                    value={formatShortDate(leadInfo.firstContactDate)}
                  />
                  <DetailItem
                    label="تاريخ آخر تواصل"
                    value={formatShortDate(leadInfo.lastContactDate)}
                  />
                  <DetailItem
                    label="مرحلة البايبلاين"
                    value={
                      leadInfo.pipelineStage
                        ? pipelineStageTranslations[leadInfo.pipelineStage]
                        : ""
                    }
                  />
                </div>
                {leadInfo.lostReason && (
                  <DetailItem label="سبب الرفض" value={leadInfo.lostReason} />
                )}
                {leadInfo?.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 opacity-70" />
                    <a
                      href={leadInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      موقع العميل
                    </a>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copy(leadInfo.website)}
                    >
                      <Clipboard className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* ملاحظة واجهة فقط */}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          تحسينات واجهة فقط — لا تغييرات في الباك-إند أو شكل البيانات.
        </div>
      </CardContent>
    </Card>
  );
}
