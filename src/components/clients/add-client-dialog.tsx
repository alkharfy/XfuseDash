
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { addDocumentNonBlocking, useFirestore } from "@/firebase";
import { useAuthStore } from "@/hooks/use-auth";
import { collection, serverTimestamp } from "firebase/firestore";
import { Textarea } from "../ui/textarea";

const clientSchema = z.object({
  name: z.string().min(3, "يجب أن يكون الاسم 3 أحرف على الأقل."),
  phone: z.string().min(10, "يجب أن يكون رقم الهاتف 10 أرقام على الأقل."),
  email: z.string().email("البريد الإلكتروني غير صالح."),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export function AddClientDialog({ children }: { children?: React.ReactNode }) {
  const { user } = useAuthStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    },
  });

  const onSubmit = (values: z.infer<typeof clientSchema>) => {
    if (!firestore || !user) return;
    
    const clientsCollection = collection(firestore, 'clients');
    const newClient = {
      name: values.name,
      phone: values.phone,
      basicInfo: {
        email: values.email,
        address: values.address || "",
        notes: values.notes || "",
      },
      registeredBy: user.uid,
      registeredAt: serverTimestamp(),
      prStatus: 'pending',
      transferStatus: 'active',
      serviceRequests: {
        marketResearch: false,
        content: false,
        creative: false,
      },
    };

    addDocumentNonBlocking(clientsCollection, newClient);

    toast({
      title: "تمت الإضافة",
      description: `تمت إضافة العميل ${values.name} بنجاح.`,
    });
    form.reset();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة عميل جديد</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم العميل</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات</FormLabel>
                  <FormControl><Textarea {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="ghost">إلغاء</Button>
              </DialogClose>
              <Button type="submit">إضافة</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
