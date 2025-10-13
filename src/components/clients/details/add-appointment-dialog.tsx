"use client";

import { useState, useMemo } from "react";
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
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { arrayUnion, doc } from "firebase/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Clock, Info } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfToday, isBefore } from "date-fns";
import { ar } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import type { Client } from "@/lib/types";

const appointmentSchema = z.object({
  date: z
    .date({ required_error: "تاريخ الموعد مطلوب." })
    .refine((d) => {
      const today = startOfToday();
      return !isBefore(d, today);
    }, "لا يمكن اختيار تاريخ سابق."),
  time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "صيغة الوقت غير صحيحة (HH:MM)."),
});

export function AddAppointmentDialog({
  children,
  client,
}: {
  children: React.ReactNode;
  client: Client;
}) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // تاريخ افتراضي = اليوم
  const defaultDate = useMemo(() => startOfToday(), []);

  const form = useForm<z.infer<typeof appointmentSchema>>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      date: defaultDate,
      time: "10:00",
    },
    mode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;
  const isValid = form.formState.isValid;

  const onSubmit = async (values: z.infer<typeof appointmentSchema>) => {
    if (!firestore) return;

    try {
      const clientRef = doc(firestore, "clients", client.id);

      const newAppointment = {
        date: values.date,
        time: values.time,
        status: "scheduled",
      };

      // من غير تغيير في منطق الحفظ
      updateDocumentNonBlocking(clientRef, {
        prAppointments: arrayUnion(newAppointment),
      });

      toast({
        title: "تمت إضافة الموعد",
        description: `تمت جدولة موعد جديد للعميل ${client.name}.`,
      });
      form.reset({ date: defaultDate, time: "10:00" });
      setIsOpen(false);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "فشل الحفظ",
        description: "حصل خطأ غير متوقع أثناء حفظ الموعد.",
      });
    }
  };

  // أوقات سريعة مقترحة
  const quickTimes = ["10:00", "12:00", "14:00", "16:00"];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة موعد جديد</DialogTitle>
          <DialogDescription>
            حدّد تاريخًا ووقتًا للتواصل مع العميل. لن يتم إشعار العميل تلقائيًا (واجهة فقط).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* التاريخ */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>التاريخ</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full ps-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر تاريخ</span>
                          )}
                          <CalendarIcon className="me-auto h-4 w-4 opacity-60" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        // تعطيل الأيام السابقة
                        disabled={(day) => isBefore(day, startOfToday())}
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="flex items-center gap-1 text-xs">
                    <Info className="h-3.5 w-3.5" />
                    لا يُسمح باختيار تواريخ سابقة لليوم.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* الوقت */}
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الوقت</FormLabel>
                  <div className="relative">
                    <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <FormControl>
                      <Input type="time" className="pr-10" step={300} {...field} />
                    </FormControl>
                  </div>
                  <FormDescription className="text-xs">
                    اختر الوقت بتنسيق 24 ساعة (HH:MM). يمكنك أيضًا استخدام الأزرار السريعة أدناه.
                  </FormDescription>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickTimes.map((t) => (
                      <Button
                        key={t}
                        type="button"
                        size="sm"
                        variant={field.value === t ? "default" : "outline"}
                        onClick={() => form.setValue("time", t, { shouldValidate: true })}
                        className="rounded-full"
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  إلغاء
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !isValid}>
                {isSubmitting ? "جاري الحفظ..." : "حفظ الموعد"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
