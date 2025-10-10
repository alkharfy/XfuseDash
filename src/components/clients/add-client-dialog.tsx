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
import { addDocumentNonBlocking, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { useAuthStore } from "@/hooks/use-auth";
import { collection, serverTimestamp, where, query } from "firebase/firestore";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@/lib/types";

const clientSchema = z.object({
  name: z.string().min(3, "يجب أن يكون اسم العميل 3 أحرف على الأقل."),
  phone: z.string().min(10, "يجب أن يكون رقم الهاتف 10 أرقام على الأقل."),
  businessName: z.string().min(2, "اسم البيزنس حقل إجباري."),
  businessField: z.string().min(2, "مجال البيزنس حقل إجباري."),
  moderatorId: z.string().optional(),
  assignedToPR: z.string({ required_error: "الرجاء اختيار مسؤول علاقات عامة." }),
  socialMediaLinks: z.string().optional(),
  transferDate: z.date().optional(),
  status: z.enum(['pending', 'in_progress', 'under_review', 'completed']).default('pending'),
  servicesOffered: z.string().optional(),
  email: z.string().email("البريد الإلكتروني غير صالح.").optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export function AddClientDialog({ children }: { children?: React.ReactNode }) {
  const { user, role } = useAuthStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const canListUsers = role === 'admin' || role === 'moderator';

  const moderatorsQuery = useMemoFirebase(() => {
    if (!firestore || !canListUsers) return null;
    return query(collection(firestore, "users"), where("role", "==", "moderator"));
  }, [firestore, canListUsers]);

  const { data: moderators } = useCollection<User>(moderatorsQuery);
  
  const prUsersQuery = useMemoFirebase(() => {
    if (!firestore || !canListUsers) return null;
    return query(collection(firestore, "users"), where("role", "==", "pr"));
  }, [firestore, canListUsers]);

  const { data: prUsers } = useCollection<User>(prUsersQuery);


  const form = useForm<z.infer<typeof clientSchema>>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      phone: "",
      businessName: "",
      businessField: "",
      socialMediaLinks: "",
      servicesOffered: "",
      email: "",
      address: "",
      notes: "",
      status: "pending",
      moderatorId: role === 'moderator' ? user?.uid : undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof clientSchema>) => {
    if (!firestore || !user) return;
    
    const clientsCollection = collection(firestore, 'clients');
    const moderatorId = role === 'moderator' ? user.uid : values.moderatorId;

    if (!moderatorId) {
      form.setError("moderatorId", { message: "الرجاء اختيار مودريتور." });
      return;
    }

    const newClient = {
      ...values,
      moderatorId: moderatorId,
      registeredBy: user.uid,
      registeredAt: serverTimestamp(),
      transferDate: values.transferDate ? serverTimestamp() : null,
      prStatus: values.status,
      transferStatus: 'active',
      serviceRequests: {
        marketResearch: false,
        content: false,
        creative: false,
      },
      basicInfo: {
          email: values.email || "",
          address: values.address || "",
          notes: values.notes || "",
      },
      finalAgreement: {
        approved: false,
        agreementDetails: '',
        duration: 0,
        startDate: null,
        approvedBy: '',
        approvedAt: null,
      }
    };
    
    // Remove properties from newClient that are already part of basicInfo to avoid duplication
    delete (newClient as any).email;
    delete (newClient as any).address;
    delete (newClient as any).notes;


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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>إضافة عميل جديد</DialogTitle>
          <DialogDescription>أدخل البيانات الأساسية للعميل الجديد ليتم إضافته إلى النظام.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto p-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم البيزنس</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessField"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مجال البيزنس</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moderatorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المودريتور</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={role === 'moderator'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المودريتور" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {role === 'moderator' && user && user.displayName ? (
                           <SelectItem key={user.uid} value={user.uid}>{user.displayName}</SelectItem>
                        ) : (
                          moderators?.map(mod => (
                            <SelectItem key={mod.id} value={mod.id}>{mod.name}</SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedToPR"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسؤول (PR)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر مسؤول العلاقات العامة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {prUsers?.map(pr => (
                          <SelectItem key={pr.id} value={pr.id}>{pr.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="transferDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ التحويل</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "d/M/yyyy")
                            ) : (
                              <span>اختر تاريخ</span>
                            )}
                            <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الحالة (Statue)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">معلق</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="under_review">قيد المراجعة</SelectItem>
                        <SelectItem value="completed">مكتمل</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <FormControl><Input {...field} type="email" /></FormControl>
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
            </div>
             <FormField
                control={form.control}
                name="socialMediaLinks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>لينكات السوشيال ميديا</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="servicesOffered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الخدمات المعروضة</FormLabel>
                    <FormControl><Textarea {...field} /></FormControl>
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
