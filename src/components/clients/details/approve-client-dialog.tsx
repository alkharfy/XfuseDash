"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { useAuthStore } from "@/hooks/use-auth";
import { doc, serverTimestamp } from "firebase/firestore";
import { Textarea } from "../../ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { Client } from "@/lib/types";

const services = [
  { id: "marketResearch", label: "أبحاث السوق" },
  { id: "content", label: "المحتوى" },
  { id: "creative", label: "الإبداع (ديزاين)" },
  { id: "aiVideo", label: "فيديو AI" },
  { id: "ads", label: "ADS" },
] as const;


const approveClientSchema = z.object({
  agreedPrice: z.coerce.number().min(0, "السعر يجب أن يكون رقمًا موجبًا."),
  firstPayment: z.coerce.number().min(0, "الدفعة الأولى يجب أن تكون رقمًا موجبًا."),
  paymentScreenshotUrl: z.string().optional(),
  requiredExecution: z.string().optional(),
  duration: z.coerce.number().int().min(1, "المدة يجب أن تكون شهرًا واحدًا على الأقل."),
  serviceRequests: z.object({
    marketResearch: z.boolean().default(false),
    content: z.boolean().default(false),
    creative: z.boolean().default(false),
    aiVideo: z.boolean().default(false),
    ads: z.boolean().default(false),
  }).optional(),
});

export function ApproveClientDialog({ children, client }: { children: React.ReactNode, client: Client }) {
  const { user } = useAuthStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof approveClientSchema>>({
    resolver: zodResolver(approveClientSchema),
    defaultValues: {
      agreedPrice: client.finalAgreement?.agreedPrice || 0,
      firstPayment: client.finalAgreement?.firstPayment || 0,
      paymentScreenshotUrl: client.finalAgreement?.paymentScreenshotUrl || "",
      requiredExecution: client.finalAgreement?.requiredExecution || "",
      duration: client.finalAgreement?.duration || 1,
      serviceRequests: {
        marketResearch: client.serviceRequests.marketResearch,
        content: client.serviceRequests.content,
        creative: client.serviceRequests.creative,
        aiVideo: client.serviceRequests.aiVideo || false,
        ads: client.serviceRequests.ads || false,
      }
    },
  });

  const onSubmit = (values: z.infer<typeof approveClientSchema>) => {
    if (!firestore || !user) return;

    const clientRef = doc(firestore, 'clients', client.id);

    const finalAgreementData = {
        approved: true,
        approvedBy: user.uid,
        approvedAt: serverTimestamp(),
        startDate: serverTimestamp(),
        agreedPrice: values.agreedPrice,
        firstPayment: values.firstPayment,
        paymentScreenshotUrl: values.paymentScreenshotUrl,
        requiredExecution: values.requiredExecution,
        duration: values.duration,
        agreementDetails: values.requiredExecution || '',
    };

    updateDocumentNonBlocking(clientRef, {
        transferStatus: 'approved',
        serviceRequests: values.serviceRequests,
        finalAgreement: finalAgreementData
    });

    toast({
      title: "تمت الموافقة",
      description: `تمت الموافقة على العميل ${client.name} وتحويله.`,
    });
    form.reset();
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>الموافقة على العميل: {client.name}</DialogTitle>
          <DialogDescription>أدخل تفاصيل الاتفاقية النهائية مع العميل للموافقة عليه وتحويله.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agreedPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السعر المتفق عليه</FormLabel>
                    <FormControl><Input {...field} type="number" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firstPayment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدفعة الأولى</FormLabel>
                    <FormControl><Input {...field} type="number" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المدة الزمنية (بالأشهر)</FormLabel>
                    <FormControl><Input {...field} type="number" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
                <FormLabel>الخدمات المطلوبة</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 rounded-lg border p-4">
                    {services.map((service) => (
                        <FormField
                        key={service.id}
                        control={form.control}
                        name={`serviceRequests.${service.id}`}
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormLabel className="font-normal">
                                {service.label}
                            </FormLabel>
                            </FormItem>
                        )}
                        />
                    ))}
                </div>
            </div>

            <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
                <FormLabel htmlFor="payment-screenshot">إسكرين الدفع</FormLabel>
                <p className="text-sm text-muted-foreground">ارفع صورة إثبات الدفعة الأولى</p>
                <Input id="payment-screenshot" type="file" className="mx-auto" />
            </div>

             <FormField
                control={form.control}
                name="requiredExecution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المطلوب تنفيذه</FormLabel>
                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">إلغاء</Button>
              </DialogClose>
              <Button type="submit">موافقة وحفظ</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
