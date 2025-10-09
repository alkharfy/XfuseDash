"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/hooks/use-auth";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";
import { Loader2, User as UserIcon, Phone, MapPin, BookOpen, DollarSign, CalendarCheck, CalendarX, Briefcase, UserCheck, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const profileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
});

function StatCard({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string | number | undefined }) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
      <div className="rounded-full bg-primary/10 p-3 text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-bold">{value || "غير محدد"}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  const managerDocRef = useMemoFirebase(() => {
    if (!appUser?.directManagerId || !firestore) return null;
    return doc(firestore, 'users', appUser.directManagerId);
  }, [appUser, firestore]);

  const { data: manager, isLoading: isManagerLoading } = useDoc<AppUser>(managerDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      phone: appUser?.phone || "",
      address: appUser?.address || "",
    }
  });

  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!userDocRef) return;
    
    updateDocumentNonBlocking(userDocRef, values);

    toast({
      title: "تم الحفظ",
      description: "تم تحديث معلومات ملفك الشخصي بنجاح.",
    });
    setIsDialogOpen(false);
  };


  if (isAppUserLoading || isManagerLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appUser) {
    return <div className="text-center p-8">لم يتم العثور على بيانات المستخدم.</div>;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`;
    }
    return name.substring(0, 2);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4 relative">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={appUser.avatarUrl} alt={appUser.name} />
          <AvatarFallback className="text-3xl">{getInitials(appUser.name)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-3xl font-bold font-headline">{appUser.name}</h1>
          <p className="text-muted-foreground">{appUser.email}</p>
        </div>
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="absolute top-0 right-0">
              <Edit className="h-4 w-4" />
              <span className="sr-only">تعديل الملف الشخصي</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الملف الشخصي</DialogTitle>
            </DialogHeader>
            <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                 <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">إلغاء</Button>
                    </DialogClose>
                    <Button type="submit">حفظ التغييرات</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Phone} title="رقم الهاتف" value={appUser.phone} />
        <StatCard icon={MapPin} title="العنوان" value={appUser.address} />
        <StatCard icon={Briefcase} title="الدور" value={appUser.role} />
        <StatCard icon={DollarSign} title="الراتب" value={appUser.salary ? `${appUser.salary} ريال` : undefined} />
        <StatCard icon={CalendarCheck} title="أيام الحضور" value={appUser.attendanceDays} />
        <StatCard icon={CalendarX} title="أيام الغياب" value={appUser.absenceDays} />
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="text-primary"/> المدير المباشر</CardTitle>
          </CardHeader>
          <CardContent>
            {manager ? (
                 <div className="flex items-center space-x-4 space-x-reverse">
                    <Avatar>
                        <AvatarImage src={manager.avatarUrl} alt={manager.name} />
                        <AvatarFallback>{getInitials(manager.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{manager.name}</p>
                        <p className="text-sm text-muted-foreground">{manager.email}</p>
                    </div>
                </div>
            ) : <p className="text-muted-foreground">لا يوجد مدير مباشر محدد.</p> }
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="text-primary"/> الدورات التدريبية</CardTitle>
          </CardHeader>
          <CardContent>
            {appUser.courses && appUser.courses.length > 0 ? (
              <ul className="list-disc space-y-2 pr-5">
                {appUser.courses.map((course, index) => <li key={index}>{course}</li>)}
              </ul>
            ) : <p className="text-muted-foreground">لا توجد دورات محددة.</p>}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
