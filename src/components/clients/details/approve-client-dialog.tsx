"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useFirestore, updateDocumentNonBlocking, useFirebaseApp } from "@/firebase";
import { useAuthStore } from "@/hooks/use-auth";
import { doc, serverTimestamp } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Client } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, File, Info, Loader2, Upload, Wallet, DollarSign, Target, Clock3, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Progress } from "@/components/ui/progress";

// === static options (كما في الملف الأصلي) ===
const services = [
  { id: "marketResearch", label: "أبحاث السوق" },
  { id: "content", label: "المحتوى" },
  { id: "creative", label: "الإبداع (ديزاين)" },
  { id: "aiVideo", label: "فيديو AI" },
  { id: "ads", label: "ADS" },
] as const;

const leadSources = [
  { value: 'facebook_ads', label: 'Facebook Ads' },
  { value: 'instagram_ads', label: 'Instagram Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'tiktok_ads', label: 'TikTok Ads' },
  { value: 'referral', label: 'إحالة' },
  { value: 'organic', label: 'بحث طبيعي' },
  { value: 'website', label: 'الموقع الإلكتروني' },
  { value: 'event', label: 'فعاليات' },
];

const pipelineStages = [
  { value: 'new', label: 'جديد' },
  { value: 'qualified', label: 'مؤهل' },
  { value: 'proposal_sent', label: 'تم إرسال العرض' },
  { value: 'negotiation', label: 'تفاوض' },
  { value: 'won', label: 'مقبول' },
  { value: 'lost', label: 'مرفوض' },
  { value: 'on_hold', label: 'معلق' },
];

const platforms = [
  { id: 'facebook', label: 'فيسبوك' },
  { id: 'instagram', label: 'إنستجرام' },
  { id: 'tiktok', label: 'تيك توك' },
  { id: 'linkedin', label: 'لينكدإن' },
  { id: 'snapchat', label: 'سناب شات' },
  { id: 'google', label: 'جوجل' },
];

const languages = [
  { id: 'ar', label: 'عربي' },
  { id: 'en', label: 'إنجليزي' },
  { id: 'ar_en', label: 'ثنائي اللغة' },
];

const clientMaterials = [
  { id: 'logo', label: 'لوجو' },
  { id: 'identity_guide', label: 'دليل هوية' },
  { id: 'product_images', label: 'صور منتجات' },
  { id: 'raw_videos', label: 'فيديوهات خام' },
];

const mainGoals = [
  { value: 'sales', label: 'زيادة المبيعات' },
  { value: 'bookings', label: 'حجز مواعيد' },
  { value: 'leads', label: 'جمع Leads' },
  { value: 'awareness', label: 'وعي بالعلامة التجارية' },
];

const approveClientSchema = z.object({
  agreedPrice: z.coerce.number().min(0, "السعر يجب أن يكون رقمًا موجبًا.").optional(),
  firstPayment: z.coerce.number().min(0, "الدفعة الأولى يجب أن تكون رقمًا موجبًا.").optional(),
  paymentScreenshots: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
  requiredExecution: z.string().optional(),
  duration: z.coerce.number().int().min(1, "المدة يجب أن تكون شهرًا واحدًا على الأقل.").optional(),
  serviceRequests: z.object({
    marketResearch: z.boolean().default(false),
    content: z.boolean().default(false),
    creative: z.boolean().default(false),
    aiVideo: z.boolean().default(false),
    ads: z.boolean().default(false),
  }).optional(),
  currency: z.string().optional(),
  paymentPlan: z.string().optional(),
  paymentMethod: z.string().optional(),

  preferredContactMethod: z.enum(['whatsapp', 'phone', 'email']).optional(),
  bestContactTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
  clientTimezone: z.string().optional(),
  alternativeContactName: z.string().optional(),
  alternativeContactNumber: z.string().optional(),

  leadSource: z.enum(['facebook_ads', 'instagram_ads', 'google_ads', 'tiktok_ads', 'referral', 'organic', 'website', 'event']).optional(),
  campaignName: z.string().optional(),
  firstContactDate: z.date().optional(),
  lastContactDate: z.date().optional(),
  pipelineStage: z.enum(['new', 'qualified', 'proposal_sent', 'negotiation', 'won', 'lost', 'on_hold']).optional(),
  lostReason: z.string().optional(),

  packageOrPlanName: z.string().optional(),
  detailedServices: z.string().optional(),
  platforms: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  clientMaterials: z.array(z.string()).optional(),
  photographyNeeded: z.boolean().optional(),
  photographyDetails: z.string().optional(),
  usp: z.string().optional(),
  brandSafety: z.string().optional(),

  mainGoal: z.enum(['sales', 'bookings', 'leads', 'awareness']).optional(),
  monthlyTargets: z.string().optional(),
  aov: z.coerce.number().optional(),
  goalTimeline: z.string().optional(),
});

type UploadingFile = { id: string; name: string; progress: number };

export function ApproveClientDialog({ children, client }: { children: React.ReactNode; client: Client }) {
  const { user } = useAuthStore();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  const storage = getStorage(firebaseApp);
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedScreenshots, setUploadedScreenshots] = useState<{ name: string; url: string }[]>(client.finalAgreement?.paymentScreenshots || []);

  const form = useForm<z.infer<typeof approveClientSchema>>({
    resolver: zodResolver(approveClientSchema),
    defaultValues: {
      agreedPrice: client.finalAgreement?.agreedPrice || 0,
      firstPayment: client.finalAgreement?.firstPayment || 0,
      paymentScreenshots: client.finalAgreement?.paymentScreenshots || [],
      requiredExecution: client.finalAgreement?.requiredExecution || "",
      duration: client.finalAgreement?.duration || 1,
      serviceRequests: client.serviceRequests || { marketResearch: false, content: false, creative: false, aiVideo: false, ads: false },
      currency: client.finalAgreement?.currency || "",
      paymentPlan: client.finalAgreement?.paymentPlan || "",
      paymentMethod: client.finalAgreement?.paymentMethod || "",

      preferredContactMethod: client.operationalData?.preferredContactMethod || undefined,
      bestContactTime: client.operationalData?.bestContactTime || undefined,
      clientTimezone: client.operationalData?.clientTimezone || "",
      alternativeContactName: client.operationalData?.alternativeContactName || "",
      alternativeContactNumber: client.operationalData?.alternativeContactNumber || "",

      leadSource: client.leadInfo?.source || undefined,
      campaignName: client.leadInfo?.campaignName || "",
      firstContactDate: client.leadInfo?.firstContactDate ? new Date(client.leadInfo.firstContactDate.seconds * 1000) : undefined,
      lastContactDate: client.leadInfo?.lastContactDate ? new Date(client.leadInfo.lastContactDate.seconds * 1000) : undefined,
      pipelineStage: client.leadInfo?.pipelineStage || undefined,
      lostReason: client.leadInfo?.lostReason || "",

      packageOrPlanName: client.scopeOfWork?.packageOrPlanName || "",
      detailedServices: client.scopeOfWork?.detailedServices || "",
      platforms: client.scopeOfWork?.platforms || [],
      languages: client.scopeOfWork?.languages || [],
      clientMaterials: client.scopeOfWork?.clientMaterials || [],
      photographyNeeded: client.scopeOfWork?.photographyNeeded || false,
      photographyDetails: client.scopeOfWork?.photographyDetails || "",
      usp: client.scopeOfWork?.usp || "",
      brandSafety: client.scopeOfWork?.brandSafety || "",

      mainGoal: client.kpis?.mainGoal || undefined,
      monthlyTargets: client.kpis?.monthlyTargets || "",
      aov: client.kpis?.aov || 0,
      goalTimeline: client.kpis?.goalTimeline || "",
    },
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;
  const canSubmit = form.formState.isValid && uploadingFiles.length === 0;

  // UI-only: شارات/ملخص علوي
  const quickSummary = useMemo(() => ([
    { icon: Wallet, label: "الدفعة الأولى", value: client.finalAgreement?.firstPayment ? `${client.finalAgreement.firstPayment} ${client.finalAgreement.currency || ""}` : "—" },
    { icon: DollarSign, label: "السعر المتفق", value: client.finalAgreement?.agreedPrice ? `${client.finalAgreement.agreedPrice} ${client.finalAgreement.currency || ""}` : "—" },
    { icon: Target, label: "الهدف", value: client.kpis?.mainGoal || "—" },
    { icon: Globe, label: "المنطقة الزمنية", value: client.operationalData?.clientTimezone || "—" },
  ]), [client]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;

    for (const file of Array.from(files)) {
      const id = Date.now().toString() + Math.random().toString();
      setUploadingFiles(prev => [...prev, { id, name: file.name, progress: 0 }]);

      const filePath = `clients/${client.id}/payments/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, progress } : f));
        },
        (error) => {
          console.error("Upload failed:", error);
          setUploadingFiles(prev => prev.filter(f => f.id !== id));
          toast({ variant: "destructive", title: `فشل رفع ${file.name}`, description: error.message });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setUploadedScreenshots(prev => [...prev, { name: file.name, url: downloadURL }]);
          setUploadingFiles(prev => prev.filter(f => f.id !== id));
          toast({ title: "نجاح", description: `تم رفع ${file.name} بنجاح.` });
        }
      );
    }
    e.target.value = '';
  };

  const onSubmit = (values: z.infer<typeof approveClientSchema>) => {
    if (!firestore || !user) return;
    const clientRef = doc(firestore, "clients", client.id);

    const dataToUpdate = {
      transferStatus: 'approved',
      serviceRequests: values.serviceRequests,
      finalAgreement: {
        approved: true,
        approvedBy: user.uid,
        approvedAt: serverTimestamp(),
        startDate: serverTimestamp(),
        agreedPrice: values.agreedPrice,
        firstPayment: values.firstPayment,
        paymentScreenshots: uploadedScreenshots,
        requiredExecution: values.requiredExecution,
        duration: values.duration,
        agreementDetails: values.requiredExecution || '',
        currency: values.currency,
        paymentPlan: values.paymentPlan,
        paymentMethod: values.paymentMethod,
      },
      operationalData: {
        internalClientId: client.id,
        preferredContactMethod: values.preferredContactMethod,
        bestContactTime: values.bestContactTime,
        clientTimezone: values.clientTimezone,
        alternativeContactName: values.alternativeContactName,
        alternativeContactNumber: values.alternativeContactNumber,
      },
      leadInfo: {
        source: values.leadSource,
        campaignName: values.campaignName,
        firstContactDate: values.firstContactDate,
        lastContactDate: values.lastContactDate,
        pipelineStage: values.pipelineStage,
        lostReason: values.lostReason,
      },
      scopeOfWork: {
        packageOrPlanName: values.packageOrPlanName,
        detailedServices: values.detailedServices,
        platforms: values.platforms,
        languages: values.languages,
        clientMaterials: values.clientMaterials,
        photographyNeeded: values.photographyNeeded,
        photographyDetails: values.photographyDetails,
        usp: values.usp,
        brandSafety: values.brandSafety,
      },
      kpis: {
        mainGoal: values.mainGoal,
        monthlyTargets: values.monthlyTargets,
        aov: values.aov,
        goalTimeline: values.goalTimeline,
      }
    } as const;

    // تنظيف قيم undefined قبل الإرسال (UI فقط، المنطق كما هو)
    (['finalAgreement','operationalData','leadInfo','scopeOfWork','kpis'] as const).forEach((k) => {
      // @ts-ignore
      Object.keys(dataToUpdate[k]).forEach((subKey) => {
        // @ts-ignore
        if (dataToUpdate[k][subKey] === undefined) delete dataToUpdate[k][subKey];
      });
    });

    updateDocumentNonBlocking(clientRef, dataToUpdate);

    toast({ title: "تمت الموافقة", description: `تمت الموافقة على العميل ${client.name} وتحويله.` });
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            الموافقة على العميل: <span className="font-headline">{client.name}</span>
          </DialogTitle>
          <DialogDescription>أدخل تفاصيل الاتفاقية النهائية مع العميل للموافقة عليه وتحويله. لا تغييرات على منطق الحفظ.</DialogDescription>
        </DialogHeader>

        {/* ملخص علوي أنيق */}
        <div className="grid gap-2 rounded-xl border p-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickSummary.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <item.icon className="h-4 w-4 opacity-70" />
              <span className="text-muted-foreground">{item.label}:</span>
              <span className="font-medium">{String(item.value)}</span>
            </div>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] pe-1">
              <Accordion type="multiple" defaultValue={["item-1","item-2","item-3","item-4","item-5"]} className="w-full px-1">
                {/* 1) بيانات تشغيلية */}
                <AccordionItem value="item-1">
                  <AccordionTrigger>1. بيانات العميل التشغيلية</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <FormItem>
                      <FormLabel>رقم عميل داخلي (Client ID)</FormLabel>
                      <FormControl>
                        <Input disabled value={client.id} />
                      </FormControl>
                      <FormDescription className="text-xs"><Info className="inline h-3.5 w-3.5" /> يتم توليده تلقائيًا—غير قابل للتعديل.</FormDescription>
                    </FormItem>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="preferredContactMethod" render={({ field }) => (
                        <FormItem>
                          <FormLabel>طريقة التواصل المفضلة</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="whatsapp">واتساب</SelectItem>
                              <SelectItem value="phone">تليفون</SelectItem>
                              <SelectItem value="email">إيميل</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="bestContactTime" render={({ field }) => (
                        <FormItem>
                          <FormLabel>أفضل وقت للاتصال</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="morning">صباحًا</SelectItem>
                              <SelectItem value="afternoon">ظهرًا</SelectItem>
                              <SelectItem value="evening">مساءً</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="clientTimezone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>منطقة/مدينة العميل + توقيته الزمني</FormLabel>
                        <FormControl><Input {...field} placeholder="مثال: الرياض (GMT+3)" /></FormControl>
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="alternativeContactName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>شخص الاتصال البديل</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="alternativeContactNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الاتصال البديل</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 2) lead */}
                <AccordionItem value="item-2">
                  <AccordionTrigger>2. مصدر وتاريخ الـLead</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="leadSource" render={({ field }) => (
                        <FormItem>
                          <FormLabel>مصدر العميل</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر المصدر..." /></SelectTrigger></FormControl>
                            <SelectContent>
                              {leadSources.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="campaignName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحملة/الإعلان (UTM)</FormLabel>
                          <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="firstContactDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>تاريخ أول تواصل</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("ps-3 text-right font-normal w-full", !field.value && "text-muted-foreground")}> {field.value ? format(field.value, "PPP") : <span>اختر تاريخ</span>} <CalendarIcon className="me-auto h-4 w-4 opacity-60" /></Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="lastContactDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>تاريخ آخر تواصل</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button variant="outline" className={cn("ps-3 text-right font-normal w-full", !field.value && "text-muted-foreground")}> {field.value ? format(field.value, "PPP") : <span>اختر تاريخ</span>} <CalendarIcon className="me-auto h-4 w-4 opacity-60" /></Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                              <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="pipelineStage" render={({ field }) => (
                      <FormItem>
                        <FormLabel>المرحلة الحالية في البايبلاين</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر المرحلة..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {pipelineStages.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="lostReason" render={({ field }) => (
                      <FormItem>
                        <FormLabel>سبب الرفض (Lost Reason)</FormLabel>
                        <FormControl><Textarea {...field} placeholder="مثال: السعر، التوقيت، المنافس..." /></FormControl>
                      </FormItem>
                    )} />
                  </AccordionContent>
                </AccordionItem>

                {/* 3) scope */}
                <AccordionItem value="item-3">
                  <AccordionTrigger>3. نطاق العمل (Scope)</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <FormField control={form.control} name="packageOrPlanName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>باكدج/خطة مختارة</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="detailedServices" render={({ field }) => (
                      <FormItem>
                        <FormLabel>الخدمات الدقيقة داخل الباقة</FormLabel>
                        <FormControl><Textarea {...field} placeholder="مثال: 12 منشور، 8 تصميمات..." /></FormControl>
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField control={form.control} name="platforms" render={() => (
                        <FormItem>
                          <FormLabel>المنصات المطلوبة</FormLabel>
                          <div className="space-y-2">
                            {platforms.map((item) => (
                              <FormField key={item.id} control={form.control} name="platforms" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse">
                                  <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((v: string) => v !== item.id))} /></FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              )} />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="languages" render={() => (
                        <FormItem>
                          <FormLabel>اللغات</FormLabel>
                          <div className="space-y-2">
                            {languages.map((item) => (
                              <FormField key={item.id} control={form.control} name="languages" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse">
                                  <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((v: string) => v !== item.id))} /></FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              )} />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="clientMaterials" render={() => (
                      <FormItem>
                        <FormLabel>المواد المتاحة من العميل</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {clientMaterials.map((item) => (
                            <FormField key={item.id} control={form.control} name="clientMaterials" render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse">
                                <FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((v: string) => v !== item.id))} /></FormControl>
                                <FormLabel className="font-normal">{item.label}</FormLabel>
                              </FormItem>
                            )} />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="photographyNeeded" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <FormLabel>احتياجات تصوير</FormLabel>
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="photographyDetails" render={({ field }) => (
                        <FormItem>
                          <FormLabel>تفاصيل التصوير</FormLabel>
                          <FormControl><Input {...field} placeholder="مدينة/تاريخ مقترح..." /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="usp" render={({ field }) => (
                      <FormItem>
                        <FormLabel>نقاط تميّز/USP ورسائل أساسية</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="brandSafety" render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمات محظورة/خطوط حمراء</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </AccordionContent>
                </AccordionItem>

                {/* 4) KPIs */}
                <AccordionItem value="item-4">
                  <AccordionTrigger>4. الأهداف والمؤشرات (KPIs)</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <FormField control={form.control} name="mainGoal" render={({ field }) => (
                      <FormItem>
                        <FormLabel>الهدف الرئيسي</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر الهدف..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {mainGoals.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="monthlyTargets" render={({ field }) => (
                      <FormItem>
                        <FormLabel>أرقام مستهدفة شهرية</FormLabel>
                        <FormControl><Input {...field} placeholder="e.g., 100 leads, 5% CTR" /></FormControl>
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="aov" render={({ field }) => (
                        <FormItem>
                          <FormLabel>متوسط سلة/قيمة الطلب (AOV)</FormLabel>
                          <FormControl><Input type="number" {...field} /></FormControl>
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="goalTimeline" render={({ field }) => (
                        <FormItem>
                          <FormLabel>ربط الهدف بزمن</FormLabel>
                          <FormControl><Input {...field} placeholder="هدف 30 يوم / 90 يوم" /></FormControl>
                        </FormItem>
                      )} />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* 5) الدفع */}
                <AccordionItem value="item-5">
                  <AccordionTrigger>5. التسعير والدفع</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="agreedPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعر المتفق عليه</FormLabel>
                          <FormControl><Input {...field} type="number" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="firstPayment" render={({ field }) => (
                        <FormItem>
                          <FormLabel>الدفعة الأولى</FormLabel>
                          <FormControl><Input {...field} type="number" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="duration" render={({ field }) => (
                        <FormItem>
                          <FormLabel>المدة الزمنية (بالأشهر)</FormLabel>
                          <FormControl><Input {...field} type="number" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="currency" render={({ field }) => (
                        <FormItem>
                          <FormLabel>العملة</FormLabel>
                          <FormControl><Input {...field} placeholder="e.g. SAR" /></FormControl>
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="paymentPlan" render={({ field }) => (
                      <FormItem>
                        <FormLabel>خطة التقسيط/الدفعات</FormLabel>
                        <FormControl><Input {...field} placeholder="50% مقدّم / شهري..." /></FormControl>
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                      <FormItem>
                        <FormLabel>وسيلة الدفع</FormLabel>
                        <FormControl><Input {...field} placeholder="فوري/تحويل/كاش..." /></FormControl>
                      </FormItem>
                    )} />

                    <div className="space-y-4">
                      <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                        <FormLabel htmlFor="payment-screenshot">إسكرين الدفع</FormLabel>
                        <p className="text-sm text-muted-foreground">ارفع صور إثبات الدفع</p>
                        <Input id="payment-screenshot" type="file" className="hidden" onChange={handleFileChange} multiple />
                        <Button asChild variant="outline" size="sm"><label htmlFor="payment-screenshot">تصفح الملفات</label></Button>
                      </div>

                      {/* ملفات قيد الرفع */}
                      {uploadingFiles.map(file => (
                        <div key={file.id} className="space-y-1">
                          <div className="flex justify-between items-center text-sm">
                            <span className="truncate max-w-[200px]">{file.name}</span>
                            <span className="text-muted-foreground">{Math.round(file.progress)}%</span>
                          </div>
                          <Progress value={file.progress} />
                        </div>
                      ))}

                      {/* ملفات مرفوعة */}
                      {uploadedScreenshots.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">الملفات المرفوعة:</h5>
                          {uploadedScreenshots.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 rounded-md border text-sm">
                              <a href={file.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                <File className="h-4 w-4" />
                                {file.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 pt-4">
                      <FormLabel>الخدمات المطلوبة</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-lg border p-4">
                        {services.map((service) => (
                          <FormField key={service.id} control={form.control} name={`serviceRequests.${service.id}` as const} render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel className="font-normal">{service.label}</FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                    </div>

                    <FormField control={form.control} name="requiredExecution" render={({ field }) => (
                      <FormItem>
                        <FormLabel>المطلوب تنفيذه (تفاصيل الاتفاق)</FormLabel>
                        <FormControl><Textarea {...field} rows={4} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </ScrollArea>

            <DialogFooter className="pt-4">
              <div className="me-auto flex items-center gap-2 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                قد يستغرق رفع الملفات وقتًا حسب حجمها وسرعة الشبكة.
              </div>
              <DialogClose asChild>
                <Button type="button" variant="ghost">إلغاء</Button>
              </DialogClose>
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                {isSubmitting && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                موافقة وحفظ
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
