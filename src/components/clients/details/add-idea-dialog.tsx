"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useFirestore, updateDocumentNonBlocking } from "@/firebase";
import { arrayUnion, doc } from "firebase/firestore";
import type { Client } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ideaSchema = z.object({
  idea: z.string().min(5, "يجب أن تكون الفكرة 5 أحرف على الأقل."),
  status: z.string().min(1, "الحالة مطلوبة."),
});

export function AddIdeaDialog({ children, client, selectedDate }: { children: React.ReactNode, client: Client, selectedDate: Date | undefined }) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof ideaSchema>>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      idea: "",
      status: "scheduled",
    },
  });

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

    const newIdea = {
      ...values,
      date: selectedDate,
    };

    updateDocumentNonBlocking(clientRef, {
        contentCalendar: arrayUnion(newIdea)
    });

    toast({
      title: "تمت إضافة الفكرة",
      description: `تمت إضافة فكرة جديدة في تقويم المحتوى.`,
    });
    form.reset();
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>إضافة فكرة جديدة</DialogTitle>
          <DialogDescription>أضف فكرة إبداعية لتقويم المحتوى.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="idea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الفكرة</FormLabel>
                    <FormControl>
                        <Textarea {...field} placeholder="اكتب تفاصيل الفكرة الإبداعية هنا..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">مجدولة</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتملة</SelectItem>
                        <SelectItem value="cancelled">ملغاة</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">إلغاء</Button>
              </DialogClose>
              <Button type="submit">إضافة الفكرة</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
