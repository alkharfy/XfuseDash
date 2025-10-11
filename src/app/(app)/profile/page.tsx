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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

const profileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
});

function StatItem({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value?: string | number }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
      <div className="rounded-full bg-primary/10 p-3 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{title}</p>
        <p className="text-sm font-semibold">{value ?? "غير محدد"}</p>
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
      case "admin":
        return "default" as const;
      case "moderator":
        return "secondary" as const;
      case "pr":
        return "outline" as const;
      case "creative":
        return "default" as const;
      case "content":
        return "secondary" as const;
      case "market_researcher":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <div className="space-y-8 p-2 sm:p-4 lg:p-6" dir="rtl">
      {/* مسار تنقّل */}
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
      <Separator />

      {/* هيدر أنيق */}
      <Card className="overflow-hidden border-0 shadow-sm">
        <div className="bg-gradient-to-l from-fuchsia-500/10 via-purple-500/10 to-pink-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl sm:text-3xl">
              <UserIcon className="h-6 w-6" /> الملف الشخصي
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">معلومات حسابك داخل نظام Xfuse.</p>
          </CardHeader>
        </div>
      </Card>

      {/* رأس الصفحة */}
      <div className="relative flex flex-col items-center gap-3">
        <Avatar className="h-24 w-24 border-4 border-primary">
          <AvatarImage src={appUser.avatarUrl} alt={appUser.name} />
          <AvatarFallback className="text-3xl">{getInitials(appUser.name)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-3xl font-bold font-headline">{appUser.name}</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mt-1">
            <Mail className="h-4 w-4" />
            <span>{appUser.email}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(appUser.email)}>
              <ClipboardCopy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Badge variant={roleVariant(appUser.role)} className="rounded-2xl px-3 py-1">{appUser.role || "غير محدد"}</Badge>
            {user?.uid && (
              <Badge variant="outline" className="rounded-2xl px-3 py-1 flex items-center gap-1">
                <IdCard className="h-3.5 w-3.5" /> UID: {user.uid.slice(0, 6)}…
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(user.uid)}>
                  <ClipboardCopy className="h-3.5 w-3.5" />
                </Button>
              </Badge>
            )}
          </div>
        </div>

        {/* زر تحرير (كما هو، مع تحسينات شكلية فقط) */}
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
                        <Input inputMode="tel" placeholder="مثال: 0100 000 0000" {...field} />
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
                        <Input placeholder="المدينة — الشارع — التفاصيل" {...field} />
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

      {/* تبويبات للمحتوى */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 sm:w-auto">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="work">تفاصيل العمل</TabsTrigger>
          <TabsTrigger value="learning">التعلّم</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">البيانات الأساسية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatItem icon={Phone} title="رقم الهاتف" value={appUser.phone} />
                <StatItem icon={MapPin} title="العنوان" value={appUser.address} />
                <StatItem icon={Briefcase} title="الدور" value={appUser.role} />
                <StatItem icon={DollarSign} title="الراتب" value={appUser.salary ? `${appUser.salary} ريال` : undefined} />
                <StatItem icon={CalendarCheck} title="أيام الحضور" value={appUser.attendanceDays} />
                <StatItem icon={CalendarX} title="أيام الغياب" value={appUser.absenceDays} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work" className="mt-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="text-primary" /> المدير المباشر
                </CardTitle>
              </CardHeader>
              <CardContent>
                {manager ? (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={manager.avatarUrl} alt={manager.name} />
                      <AvatarFallback>{getInitials(manager.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{manager.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{manager.email}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(manager.email)}>
                          <ClipboardCopy className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">لا يوجد مدير مباشر محدد.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="text-primary" /> معلومات الوظيفة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <StatItem icon={Briefcase} title="المسمى" value={appUser.jobTitle} />
                  <StatItem icon={CalendarCheck} title="تاريخ الانضمام" value={appUser.joinedAt ? String((appUser as any).joinedAt) : undefined} />
                  <StatItem icon={CalendarX} title="أيام الإجازات" value={appUser.vacationDays} />
                  <StatItem icon={IdCard} title="معرّف الموظف" value={appUser.employeeId} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="text-primary" /> الدورات التدريبية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appUser.courses && appUser.courses.length > 0 ? (
                <ScrollArea className="h-56 pe-2">
                  <ul className="space-y-2 list-disc pr-5">
                    {appUser.courses.map((course, i) => (
                      <li key={i}>{course}</li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground">لا توجد دورات محددة.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    