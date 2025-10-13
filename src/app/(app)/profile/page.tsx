"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/hooks/use-auth";
import { useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { doc } from "firebase/firestore";
import type { User as AppUser } from "@/lib/types";
import {
  Loader2,
  User as UserIcon,
  Phone,
  MapPin,
  BookOpen,
  DollarSign,
  CalendarCheck,
  CalendarX,
  Briefcase,
  UserCheck,
  Edit,
  ClipboardCopy,
  Mail,
  Home,
  IdCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTimestamp } from "@/lib/utils";

const profileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
});

function StatItem({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/60 p-3">
      <div className="rounded-full bg-primary/10 p-2 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-sm font-semibold">{String(value)}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuthStore();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courses, setCourses] = useState<string[]>([]);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, "users", user.uid);
  }, [user, firestore]);

  const { data: appUser, isLoading: isAppUserLoading } = useDoc<AppUser>(userDocRef);

  const managerDocRef = useMemoFirebase(() => {
    if (!appUser?.directManagerId || !firestore) return null;
    return doc(firestore, "users", appUser.directManagerId);
  }, [appUser, firestore]);

  const { data: manager, isLoading: isManagerLoading } = useDoc<AppUser>(managerDocRef);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (appUser) {
      form.reset({
        phone: appUser.phone || "",
        address: appUser.address || "",
      });
      setCourses(appUser.courses || []);
    }
  }, [appUser, form]);


  const onSubmit = (values: z.infer<typeof profileSchema>) => {
    if (!userDocRef) return;
    updateDocumentNonBlocking(userDocRef, values);
    toast({ title: "تم الحفظ", description: "تم تحديث معلومات ملفك الشخصي بنجاح." });
    setIsDialogOpen(false);
  };

  const copy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "تم النسخ", description: "تم نسخ القيمة إلى الحافظة." });
    } catch (e) {
      // واجهة فقط
    }
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
    const names = name.split(" ");
    if (names.length > 1) return `${names[0][0]}${names[1][0]}`;
    return name.substring(0, 2);
  };

  const roleVariant = (role?: string) => {
    switch (role) {
      case "admin": return "default" as const;
      case "moderator": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="text-sm text-muted-foreground flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1 hover:text-foreground">
            <Home className="h-4 w-4" /> الرئيسية
          </Link>
          <span>/</span>
          <span className="text-foreground">الملف الشخصي</span>
        </nav>
        <Badge className="rounded-2xl px-3 py-1">XFUSE</Badge>
      </div>

      <div className="relative flex flex-col items-center gap-4 text-center">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={appUser.photoURL} alt={appUser.name} />
          <AvatarFallback className="text-3xl">{getInitials(appUser.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-headline">{appUser.name}</h1>
          <div className="flex items-center justify-center gap-1 text-muted-foreground text-sm mt-1">
            <Mail className="h-4 w-4" />
            <span>{appUser.email}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(appUser.email)}>
              <ClipboardCopy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge variant={roleVariant(appUser.role)} className="rounded-md">{appUser.role || "غير محدد"}</Badge>
            {user?.uid && (
              <Badge variant="outline" className="rounded-md font-mono text-xs">
                {user.uid.slice(0, 12)}...
              </Badge>
            )}
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="absolute top-0 right-0 gap-1">
              <Edit className="h-4 w-4" /> <span className="hidden sm:inline">تعديل</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الملف الشخصي</DialogTitle>
              <DialogDescription>تحديث معلومات الاتصال الخاصة بك.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم الهاتف</FormLabel>
                    <FormControl><Input inputMode="tel" placeholder="مثال: 0100 000 0000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem>
                    <FormLabel>العنوان</FormLabel>
                    <FormControl><Input placeholder="المدينة — الشارع — التفاصيل" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost">إلغاء</Button></DialogClose>
                  <Button type="submit">حفظ التغييرات</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="work">تفاصيل العمل</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">البيانات الأساسية</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatItem icon={Phone} title="رقم الهاتف" value={appUser.phone} />
                <StatItem icon={MapPin} title="العنوان" value={appUser.address} />
                <StatItem icon={Briefcase} title="الدور" value={appUser.role} />
                <StatItem icon={DollarSign} title="الراتب" value={appUser.salary ? `${appUser.salary} ريال` : null} />
                <StatItem icon={CalendarCheck} title="أيام الحضور" value={appUser.attendanceDays} />
                <StatItem icon={CalendarX} title="أيام الغياب" value={appUser.absenceDays} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="text-primary" /> المدير المباشر</CardTitle></CardHeader>
              <CardContent>
                {manager ? (
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarImage src={manager.photoURL} alt={manager.name} /><AvatarFallback>{getInitials(manager.name)}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-semibold">{manager.name}</p>
                      <p className="text-sm text-muted-foreground">{manager.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا يوجد مدير مباشر محدد.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="text-primary" /> معلومات الوظيفة</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <StatItem icon={Briefcase} title="المسمى" value={appUser.jobTitle} />
                <StatItem icon={CalendarCheck} title="تاريخ الانضمام" value={appUser.joinedAt ? formatTimestamp(appUser.joinedAt, 'PP') : null} />
                <StatItem icon={CalendarX} title="أيام الإجازات" value={appUser.vacationDays} />
                <StatItem icon={IdCard} title="معرّف الموظف" value={appUser.employeeId} />
              </CardContent>
            </Card>
             <Card className="md:col-span-2">
                <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="text-primary" /> الدورات التدريبية</CardTitle></CardHeader>
                <CardContent>
                {courses.length > 0 ? (
                    <ScrollArea className="h-40 pe-2">
                    <ul className="space-y-2 list-disc pr-5">
                        {courses.map((course, i) => (
                        <li key={i}>{course}</li>
                        ))}
                    </ul>
                    </ScrollArea>
                ) : (
                    <p className="text-muted-foreground p-4 text-center">لا توجد دورات محددة.</p>
                )}
                </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
