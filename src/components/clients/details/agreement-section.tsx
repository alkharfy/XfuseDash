import { Client } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { File, Link as LinkIcon } from "lucide-react";

const DetailItem = ({ label, value }: { label: string, value: any }) => {
    if (!value) return null;
    return (
        <p><strong>{label}:</strong> {String(value)}</p>
    );
};

const leadSourceTranslations: { [key: string]: string } = {
    'facebook_ads': 'Facebook Ads',
    'instagram_ads': 'Instagram Ads',
    'google_ads': 'Google Ads',
    'tiktok_ads': 'TikTok Ads',
    'referral': 'إحالة',
    'organic': 'بحث طبيعي',
    'website': 'الموقع الإلكتروني',
    'event': 'فعاليات',
};

const pipelineStageTranslations: { [key: string]: string } = {
    'new': 'جديد',
    'qualified': 'مؤهل',
    'proposal_sent': 'تم إرسال العرض',
    'negotiation': 'تفاوض',
    'won': 'مقبول',
    'lost': 'مرفوض',
    'on_hold': 'معلق',
};

const mainGoalTranslations: { [key: string]: string } = {
    'sales': 'زيادة المبيعات',
    'bookings': 'حجز مواعيد',
    'leads': 'جمع Leads',
    'awareness': 'وعي بالعلامة التجارية',
};

export function AgreementSection({ client }: { client: Client }) {
    if (!client.transferStatus || client.transferStatus !== 'approved') return null;

    const { finalAgreement, operationalData, leadInfo, scopeOfWork, kpis } = client;

    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>ملف العميل الشامل (Onboarding Data)</CardTitle>
                <CardDescription>جميع تفاصيل الاتفاق والبيانات التشغيلية للعميل.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <Accordion type="multiple" defaultValue={['pricing', 'scope']} className="w-full">
                    
                    {/* التسعير والدفع */}
                    {finalAgreement && (
                        <AccordionItem value="pricing">
                            <AccordionTrigger>1. التسعير والدفع</AccordionTrigger>
                            <AccordionContent className="space-y-3">
                                <DetailItem label="السعر المتفق عليه" value={`${finalAgreement.agreedPrice || 'N/A'} ${finalAgreement.currency || ''}`} />
                                <DetailItem label="الدفعة الأولى" value={`${finalAgreement.firstPayment || 'N/A'} ${finalAgreement.currency || ''}`} />
                                <DetailItem label="مدة العقد" value={`${finalAgreement.duration || 'N/A'} أشهر`} />
                                <DetailItem label="خطة الدفع" value={finalAgreement.paymentPlan} />
                                <DetailItem label="وسيلة الدفع" value={finalAgreement.paymentMethod} />
                                <DetailItem label="تفاصيل التنفيذ" value={finalAgreement.agreementDetails} />
                                <DetailItem label="تاريخ البدء" value={formatShortDate(finalAgreement.startDate)} />
                                 {finalAgreement.paymentScreenshots && finalAgreement.paymentScreenshots.length > 0 && (
                                    <div>
                                        <strong>إثباتات الدفع:</strong>
                                        <div className="flex flex-col gap-2 mt-2">
                                            {finalAgreement.paymentScreenshots.map((file, index) => (
                                                 <a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                    <File className="h-4 w-4" />
                                                    {file.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* نطاق العمل */}
                    {scopeOfWork && (
                        <AccordionItem value="scope">
                            <AccordionTrigger>2. نطاق العمل (Scope)</AccordionTrigger>
                            <AccordionContent className="space-y-3">
                                <DetailItem label="اسم الباقة/الخطة" value={scopeOfWork.packageOrPlanName} />
                                <DetailItem label="الخدمات الدقيقة" value={scopeOf_Work.detailedServices} />
                                <DetailItem label="نقاط التميز (USP)" value={scopeOfWork.usp} />
                                <DetailItem label="الخطوط الحمراء (Brand Safety)" value={scopeOfWork.brandSafety} />
                                {scopeOfWork.platforms && <p><strong>المنصات:</strong> {scopeOfWork.platforms.join(', ')}</p>}
                                {scopeOfWork.languages && <p><strong>اللغات:</strong> {scopeOfWork.languages.join(', ')}</p>}
                                {scopeOfWork.clientMaterials && <p><strong>المواد المتاحة:</strong> {scopeOfWork.clientMaterials.join(', ')}</p>}
                                <p><strong>احتياج تصوير:</strong> {scopeOfWork.photographyNeeded ? `نعم (${scopeOfWork.photographyDetails || ''})` : 'لا'}</p>
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* الأهداف والمؤشرات */}
                    {kpis && (
                        <AccordionItem value="kpis">
                            <AccordionTrigger>3. الأهداف والمؤشرات (KPIs)</AccordionTrigger>
                            <AccordionContent className="space-y-3">
                                <DetailItem label="الهدف الرئيسي" value={kpis.mainGoal ? mainGoalTranslations[kpis.mainGoal] : ''} />
                                <DetailItem label="أرقام مستهدفة شهرية" value={kpis.monthlyTargets} />
                                <DetailItem label="متوسط قيمة الطلب (AOV)" value={kpis.aov} />
                                <DetailItem label="الجدول الزمني للهدف" value={kpis.goalTimeline} />
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* البيانات التشغيلية */}
                    {operationalData && (
                        <AccordionItem value="operational-data">
                            <AccordionTrigger>4. البيانات التشغيلية</AccordionTrigger>
                            <AccordionContent className="space-y-3">
                                <DetailItem label="رقم العميل الداخلي" value={operationalData.internalClientId} />
                                <DetailItem label="طريقة التواصل المفضلة" value={operationalData.preferredContactMethod} />
                                <DetailItem label="أفضل وقت للتواصل" value={operationalData.bestContactTime} />
                                <DetailItem label="المنطقة الزمنية" value={operationalData.clientTimezone} />
                                <DetailItem label="جهة اتصال بديلة" value={`${operationalData.alternativeContactName || ''} (${operationalData.alternativeContactNumber || ''})`} />
                            </AccordionContent>
                        </AccordionItem>
                    )}

                    {/* معلومات الـLead */}
                    {leadInfo && (
                        <AccordionItem value="lead-info">
                            <AccordionTrigger>5. معلومات الـLead</AccordionTrigger>
                            <AccordionContent className="space-y-3">
                                <DetailItem label="مصدر العميل" value={leadInfo.source ? leadSourceTranslations[leadInfo.source] : ''} />
                                <DetailItem label="اسم الحملة" value={leadInfo.campaignName} />
                                <DetailItem label="تاريخ أول تواصل" value={formatShortDate(leadInfo.firstContactDate)} />
                                <DetailItem label="تاريخ آخر تواصل" value={formatShortDate(leadInfo.lastContactDate)} />
                                <DetailItem label="مرحلة البايبلاين" value={leadInfo.pipelineStage ? pipelineStageTranslations[leadInfo.pipelineStage] : ''} />
                                {leadInfo.lostReason && <DetailItem label="سبب الرفض" value={leadInfo.lostReason} />}
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>
            </CardContent>
        </Card>
    );
}
