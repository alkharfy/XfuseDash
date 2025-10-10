"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { arrayUnion, doc } from "firebase/firestore";
import type { Client, CalendarEntry } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from 'uuid';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

const ideaSchema = z.object({
  // Planning
  title: z.string().min(3, "العنوان مطلوب (3 أحرف على الأقل)."),
  platform: z.enum(['facebook', 'instagram', 'tiktok', 'youtube', 'linkedin', 'x', 'stories', 'reels', 'shorts']).optional(),
  format: z.enum(['image', 'carousel', 'reels', 'video', 'story', 'text', 'link', 'live']).optional(),
  postGoal: z.enum(['awareness', 'engagement', 'traffic', 'leads', 'sales', 'retention']).optional(),
  contentPillar: z.enum(['educational', 'awareness', 'entertainment', 'offer', 'social_proof', 'behind_scenes', 'brand_values']).optional(),
  language: z.enum(['ar', 'en', 'ar_en']).optional(),
  campaign: z.string().optional(),
  targetAudience: z.string().optional(),
  
  // Creative
  caption: z.string().optional(),
  cta: z.string().optional(),
  customCta: z.string().optional(),
  hashtags: z.string().optional(),
  designNotes: z.string().optional(),
  references: z.string().optional(),
  brandAssets: z.array(z.string()).optional(),

  // Technical Specs
  dimensions: z.enum(['1:1', '4:5', '9:16', '16:9']).optional(),
  videoDuration: z.coerce.number().optional(),
exportPreset: z.string().optional(),
  subtitles: z.boolean().optional(),

  // Workflow
  approvalStatus: z.enum(['draft', 'review', 'with_client', 'approved', 'rejected']).optional(),

  // Publishing
  publishMethod: z.enum(['manual', 'scheduled', 'tool']).optional(),
  schedulingTool: z.enum(['meta', 'hootsuite', 'buffer', 'native']).optional(),
  postUrl: z.string().url({ message: "الرجاء إدخال رابط صحيح." }).optional().or(z.literal('')),
  isBoosted: z.boolean().optional(),
  boostBudget: z.coerce.number().optional(),
  utm: z.string().optional(),

  // Performance
  reach: z.coerce.number().optional(),
  impressions: z.coerce.number().optional(),
  likes: z.coerce.number().optional(),
  comments: z.coerce.number().optional(),
  shares: z.coerce.number().optional(),
  saves: z.coerce.number().optional(),
  ctr: z.coerce.number().optional(),
  cpc: z.coerce.number().optional(),
  cpl: z.coerce.number().optional(),
  roas: z.coerce.number().optional(),
  performanceNotes: z.string().optional(),
});

interface IdeaDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    client: Client;
    selectedDate: Date | undefined;
    idea: CalendarEntry | null;
}

const availableBrandAssets = [
    { id: 'logo', label: 'لوجو' },
    { id: 'identity_guide', label: 'دليل هوية' },
    { id: 'raw_images', label: 'صور خام' },
    { id: 'product_library', label: 'مكتبة منتجات' },
]

const ctaOptions = [
    { value: 'تواصل واتساب', label: 'تواصل واتساب' },
    { value: 'احجز الآن', label: 'احجز الآن' },
    { value: 'اشتري الآن', label: 'اشتري الآن' },
    { value: 'اعرف المزيد', label: 'اعرف المزيد' },
    { value: 'تواصل معنا', label: 'تواصل معنا' },
    { value: 'اشترك', label: 'اشترك' },
    { value: 'سجّل', label: 'سجّل' },
    { value: 'حمّل الدليل', label: 'حمّل الدليل' },
    { value: 'استخدم الكوبون', label: 'استخدم الكوبون' },
    { value: 'custom', label: 'قيمة مخصصة...' },
];

export function IdeaDialog({ isOpen, setIsOpen, client, selectedDate, idea }: IdeaDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const isCustomCta = ctaOptions.find(opt => opt.value === idea?.cta) === undefined && !!idea?.cta;

  const form = useForm<z.infer<typeof ideaSchema>>({
    resolver: zodResolver(ideaSchema),
    values: idea ? 
    {
        title: idea.title || idea.idea || "",
        platform: idea.platform,
        format: idea.format,
        postGoal: idea.postGoal,
        contentPillar: idea.contentPillar,
        language: idea.language,
        campaign: idea.campaign || "",
        targetAudience: idea.targetAudience || "",
        caption: idea.caption || "",
        cta: isCustomCta ? 'custom' : idea.cta || undefined,
        customCta: isCustomCta ? idea.cta : "",
        hashtags: idea.hashtags || "",
        designNotes: idea.designNotes || "",
        references: idea.references || "",
        brandAssets: idea.brandAssets || [],
        dimensions: idea.dimensions,
        videoDuration: idea.videoDuration || undefined,
        exportPreset: idea.exportPreset || "",
        subtitles: idea.subtitles || false,
        approvalStatus: idea.approvalStatus || (idea.status ? 'draft' : undefined),
        publishMethod: idea.publishMethod,
        schedulingTool: idea.schedulingTool,
        postUrl: idea.postUrl || "",
        isBoosted: idea.isBoosted || false,
        boostBudget: idea.boostBudget || undefined,
        utm: idea.utm || "",
        reach: idea.reach || undefined,
        impressions: idea.impressions || undefined,
        likes: idea.likes || undefined,
        comments: idea.comments || undefined,
        shares: idea.shares || undefined,
        saves: idea.saves || undefined,
        ctr: idea.ctr || undefined,
        cpc: idea.cpc || undefined,
        cpl: idea.cpl || undefined,
        roas: idea.roas || undefined,
        performanceNotes: idea.performanceNotes || "",
    } 
    : {
      title: "",
      platform: undefined,
      format: undefined,
      postGoal: undefined,
      contentPillar: undefined,
      language: undefined,
      campaign: "",
      targetAudience: "",
      caption: "",
      cta: undefined,
      customCta: "",
      hashtags: "",
      designNotes: "",
      references: "",
      brandAssets: [],
      dimensions: undefined,
      videoDuration: undefined,
      exportPreset: "",
      subtitles: false,
      approvalStatus: 'draft',
      publishMethod: undefined,
      schedulingTool: undefined,
      postUrl: "",
      isBoosted: false,
      boostBudget: undefined,
      utm: "",
      reach: undefined,
      impressions: undefined,
      likes: undefined,
      comments: undefined,
      shares: undefined,
      saves: undefined,
      ctr: undefined,
      cpc: undefined,
      cpl: undefined,
      roas: undefined,
      performanceNotes: "",
    },
  });

  const watchCta = useWatch({ control: form.control, name: 'cta' });
  const watchIsBoosted = useWatch({ control: form.control, name: 'isBoosted' });


  const onSubmit = (values: z.infer<typeof ideaSchema>) => {
    if (!firestore || !selectedDate) {
        toast({
            variant: "destructive",
            title: "خطأ",
            description: "الرجاء تحديد تاريخ أولاً."
        });
        return;
    };

    const clientRef = doc(firestore, 'clients', client.id);
    const currentCalendar = client.contentCalendar || [];
    
    let newCalendar: CalendarEntry[];
    
    const finalCta = values.cta === 'custom' ? values.customCta : values.cta;
    const dataToSave = { ...values, cta: finalCta };
    delete (dataToSave as any).customCta;

    if(idea) { // Editing existing idea
        newCalendar = currentCalendar.map(entry => {
            if(entry.id === idea.id) {
                return { ...entry, ...dataToSave, title: dataToSave.title };
            }
            return entry;
        });
    } else { // Adding new idea
        const newIdea: CalendarEntry = {
            ...dataToSave,
            title: dataToSave.title,
            id: uuidv4(),
            date: selectedDate,
        };
        newCalendar = [...currentCalendar, newIdea];
    }

    updateDocumentNonBlocking(clientRef, {
        contentCalendar: newCalendar
    });

    toast({
      title: idea ? "تم تحديث الفكرة" : "تمت إضافة الفكرة",
      description: `تم حفظ "${values.title}" بنجاح.`,
    });
    form.reset();
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{idea ? 'تعديل فكرة' : 'إضافة فكرة جديدة'}</DialogTitle>
          <DialogDescription>
            {idea ? `تعديل تفاصيل فكرة "${idea.title || idea.idea}"` : 'أدخل تفاصيل الفكرة الإبداعية الجديدة لتقويم المحتوى.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[70vh] p-4">
              <div className="space-y-8">
                {/* Planning Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">1. التخطيط والمعلومات الأساسية</h3>
                   <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>العنوان/الفكرة الأساسية</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="platform" render={({ field }) => (
                      <FormItem>
                        <FormLabel>المنصّة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر المنصة..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                <SelectItem value="x">X</SelectItem>
                                <SelectItem value="stories">Stories</SelectItem>
                                <SelectItem value="reels">Reels</SelectItem>
                                <SelectItem value="shorts">Shorts</SelectItem>
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="format" render={({ field }) => (
                      <FormItem>
                        <FormLabel>نوع المحتوى</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl><SelectTrigger><SelectValue placeholder="اختر النوع..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="image">صورة ثابتة</SelectItem>
                                <SelectItem value="carousel">كاروسيل</SelectItem>
                                <SelectItem value="reels">ريلز</SelectItem>
                                <SelectItem value="video">فيديو طويل</SelectItem>
                                <SelectItem value="story">ستوري</SelectItem>
                                <SelectItem value="text">بوست نصي</SelectItem>
                                <SelectItem value="link">لينك</SelectItem>
                                <SelectItem value="live">لايف</SelectItem>
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="postGoal" render={({ field }) => (
                      <FormItem>
                        <FormLabel>هدف البوست</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl><SelectTrigger><SelectValue placeholder="اختر الهدف..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="awareness">Awareness</SelectItem>
                                <SelectItem value="engagement">Engagement</SelectItem>
                                <SelectItem value="traffic">Traffic</SelectItem>
                                <SelectItem value="leads">Leads</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="retention">Retention</SelectItem>
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="contentPillar" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ركيزة المحتوى</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl><SelectTrigger><SelectValue placeholder="اختر الركيزة..." /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="educational">تعليمي</SelectItem>
                                <SelectItem value="awareness">توعوي</SelectItem>
                                <SelectItem value="entertainment">ترفيهي</SelectItem>
                                <SelectItem value="offer">عرض/خصم</SelectItem>
                                <SelectItem value="social_proof">شواهد اجتماعية</SelectItem>
                                <SelectItem value="behind_scenes">كواليس</SelectItem>
                                <SelectItem value="brand_values">قيم العلامة</SelectItem>
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="language" render={({ field }) => (
                      <FormItem>
                        <FormLabel>اللغة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl><SelectTrigger><SelectValue placeholder="اختر اللغة..." /></SelectTrigger></FormControl>
                            <SelectContent>
                               <SelectItem value="ar">AR</SelectItem>
                               <SelectItem value="en">EN</SelectItem>
                               <SelectItem value="ar_en">AR+EN</SelectItem>
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="campaign" render={({ field }) => (
                        <FormItem>
                            <FormLabel>الحملة/الكامبين</FormLabel>
                            <FormControl><Input {...field} placeholder="اسم الحملة التابع لها البوست..."/></FormControl>
                        </FormItem>
                        )} 
                    />
                  </div>
                   <FormField control={form.control} name="targetAudience" render={({ field }) => (
                        <FormItem>
                            <FormLabel>الجمهور المستهدف</FormLabel>
                            <FormControl><Textarea {...field} placeholder="مثال: سيدات 18-24، مهتمون بالجمال..." /></FormControl>
                        </FormItem>
                    )} />
                </div>

                {/* Creative Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">2. تفاصيل الكرييتيف والنسخ</h3>
                    <FormField control={form.control} name="caption" render={({ field }) => (
                      <FormItem>
                        <FormLabel>النص/الكابتشن</FormLabel>
                        <FormControl><Textarea {...field} rows={5} /></FormControl>
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="cta" render={({ field }) => (
                        <FormItem>
                            <FormLabel>CTA</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر CTA..." /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {ctaOptions.map(option => (
                                        <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormItem>
                        )} />
                        {watchCta === 'custom' && (
                            <FormField control={form.control} name="customCta" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CTA المخصص</FormLabel>
                                    <FormControl><Input {...field} placeholder="أدخل النص المخصص هنا..."/></FormControl>
                                </FormItem>
                            )} />
                        )}
                        <FormField control={form.control} name="hashtags" render={({ field }) => (
                        <FormItem>
                            <FormLabel>الهاشتاجات</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                        </FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="designNotes" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات التصميم</FormLabel>
                        <FormControl><Textarea {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="references" render={({ field }) => (
                      <FormItem>
                        <FormLabel>المراجع/الريفرنس (URL)</FormLabel>
                        <FormControl><Input {...field} placeholder="https://example.com/reference" /></FormControl>
                      </FormItem>
                    )} />
                    <FormField
                        control={form.control}
                        name="brandAssets"
                        render={() => (
                            <FormItem>
                            <div className="mb-4">
                                <FormLabel>الأصول المتاحة</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {availableBrandAssets.map((item) => (
                                <FormField
                                key={item.id}
                                control={form.control}
                                name="brandAssets"
                                render={({ field }) => {
                                    return (
                                    <FormItem
                                        key={item.id}
                                        className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse"
                                    >
                                        <FormControl>
                                        <Checkbox
                                            checked={field.value?.includes(item.id)}
                                            onCheckedChange={(checked) => {
                                            return checked
                                                ? field.onChange([...(field.value || []), item.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                    (value) => value !== item.id
                                                    )
                                                )
                                            }}
                                        />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        {item.label}
                                        </FormLabel>
                                    </FormItem>
                                    )
                                }}
                                />
                            ))}
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                
                 {/* Technical Specs Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">3. المواصفات الفنية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="dimensions" render={({ field }) => (
                      <FormItem>
                        <FormLabel>المقاس/النسبة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر المقاس..." /></SelectTrigger></FormControl>
                            <SelectContent>
                               <SelectItem value="1:1">1:1 (Square)</SelectItem>
                               <SelectItem value="4:5">4:5 (Portrait)</SelectItem>
                               <SelectItem value="9:16">9:16 (Story/Reel)</SelectItem>
                               <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="videoDuration" render={({ field }) => (
                        <FormItem>
                            <FormLabel>مدة الفيديو (ثوانٍ)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="exportPreset" render={({ field }) => (
                      <FormItem>
                        <FormLabel>إعداد التصدير</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="اختر الإعداد..." /></SelectTrigger></FormControl>
                            <SelectContent>
                               <SelectItem value="1080p">1080p</SelectItem>
                               <SelectItem value="4k">4K</SelectItem>
                               <SelectItem value="h264">H.264</SelectItem>
                            </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="subtitles" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <FormLabel>الترجمة/Subtitles</FormLabel>
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )} />
                  </div>
                </div>

                 {/* Workflow Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">4. سير العمل والتسليمات</h3>
                   <FormField control={form.control} name="approvalStatus" render={({ field }) => (
                      <FormItem>
                        <FormLabel>حالة الموافقة</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر الحالة..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="draft">مسودة (Draft)</SelectItem>
                            <SelectItem value="review">للمراجعة (Review)</SelectItem>
                            <SelectItem value="with_client">مع العميل (With Client)</SelectItem>
                            <SelectItem value="approved">معتمد (Approved)</SelectItem>
                            <SelectItem value="rejected">مرفوض (Rejected)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                 {/* Publishing & Promotion Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-semibold text-lg">5. النشر والترويج</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="publishMethod" render={({ field }) => (
                      <FormItem>
                        <FormLabel>طريقة النشر</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر الطريقة..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="manual">يدوي (Manual)</SelectItem>
                            <SelectItem value="scheduled">جدولة (Scheduled)</SelectItem>
                            <SelectItem value="tool">عبر أداة (Tool)</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="schedulingTool" render={({ field }) => (
                      <FormItem>
                        <FormLabel>أداة الجدولة</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="اختر الأداة..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="meta">Meta Planner</SelectItem>
                            <SelectItem value="hootsuite">Hootsuite</SelectItem>
                            <SelectItem value="buffer">Buffer</SelectItem>
                            <SelectItem value="native">داخل المنصة</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="postUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>رابط المنشور بعد النشر</FormLabel>
                        <FormControl><Input {...field} placeholder="https://..."/></FormControl>
                        <FormMessage />
                    </FormItem>
                    )} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <FormField control={form.control} name="isBoosted" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <FormLabel>Boost/Ads</FormLabel>
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                        </FormItem>
                    )} />
                     {watchIsBoosted && (
                         <FormField control={form.control} name="boostBudget" render={({ field }) => (
                            <FormItem>
                                <FormLabel>ميزانية الترويج</FormLabel>
                                <FormControl><Input type="number" {...field} placeholder="0.00" /></FormControl>
                            </FormItem>
                         )} />
                     )}
                  </div>
                   <FormField control={form.control} name="utm" render={({ field }) => (
                        <FormItem>
                            <FormLabel>UTM Parameters</FormLabel>
                            <FormControl><Input {...field} placeholder="utm_source=..."/></FormControl>
                        </FormItem>
                    )} />
                </div>

                {/* Performance Section */}
                <div className="space-y-4 p-4 border rounded-lg">
                    <h3 className="font-semibold text-lg">6. قياس الأداء</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormField control={form.control} name="reach" render={({ field }) => (
                            <FormItem><FormLabel>Reach</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="impressions" render={({ field }) => (
                            <FormItem><FormLabel>Impressions</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="likes" render={({ field }) => (
                            <FormItem><FormLabel>Likes</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="comments" render={({ field }) => (
                            <FormItem><FormLabel>Comments</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="shares" render={({ field }) => (
                            <FormItem><FormLabel>Shares</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="saves" render={({ field }) => (
                            <FormItem><FormLabel>Saves</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="ctr" render={({ field }) => (
                            <FormItem><FormLabel>CTR (%)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="cpc" render={({ field }) => (
                            <FormItem><FormLabel>CPC</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="cpl" render={({ field }) => (
                            <FormItem><FormLabel>CPL</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                        <FormField control={form.control} name="roas" render={({ field }) => (
                            <FormItem><FormLabel>ROAS</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="performanceNotes" render={({ field }) => (
                        <FormItem>
                            <FormLabel>ملاحظات الأداء</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                        </FormItem>
                    )} />
                </div>


              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost">إلغاء</Button>
              </DialogClose>
              <Button type="submit">{idea ? 'حفظ التعديلات' : 'إضافة الفكرة'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
