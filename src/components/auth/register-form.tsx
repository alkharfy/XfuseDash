"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Eye, EyeOff, UserPlus, Shield, Zap } from "lucide-react";
import { UserRole } from "@/lib/types";
import Link from "next/link";

const registerSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يكون الاسم 3 أحرف على الأقل." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  role: z.enum(["moderator", "pr", "market_researcher", "creative", "content"], {
    errorMap: () => ({ message: "الرجاء اختيار دور صحيح." }),
  }),
});

const roleTranslations: Record<UserRole, string> = {
  admin: "مدير",
  moderator: "مشرف",
  pr: "علاقات عامة",
  market_researcher: "باحث سوق",
  creative: "مبدع",
  content: "محتوى",
};

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "moderator",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    setError(null);
    startTransition(async () => {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: values.name });

        // حفظ المستخدم في Firestore (بدون أي تعديل على المنطق الأصلي)
        await setDoc(doc(firestore, "users", user.uid), {
          name: values.name,
          email: values.email,
          role: values.role,
          createdAt: serverTimestamp(),
          active: true,
          id: user.uid,
        });

        router.push("/dashboard");
      } catch (e: any) {
        if (e.code === "auth/email-already-in-use") {
          setError("هذا البريد الإلكتروني مستخدم بالفعل.");
        } else if (e.code === "auth/weak-password") {
          setError("كلمة المرور ضعيفة جداً.");
        } else {
          setError("حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.");
          console.error(e);
        }
      }
    });
  };

  // UI-only: شريط قوة كلمة المرور (بسيط)
  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0..4
  };

  const pwd = form.watch("password");
  const strength = passwordStrength(pwd);
  const strengthLabel = ["ضعيفة", "مقبولة", "جيدة", "قوية"][Math.max(0, strength - 1)] || "—";

  return (
    <div dir="rtl" className="w-full">
      <Card className="w-full overflow-hidden border-0 shadow-sm">
        <div className="bg-gradient-to-l from-fuchsia-500/15 via-purple-500/15 to-pink-500/15">
          <CardHeader className="pb-2 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <CardTitle className="font-headline text-2xl">إنشاء حساب</CardTitle>
            <CardDescription className="mt-1 text-sm">
              أنشئ حسابك للانضمام إلى لوحة Xfuse وإدارة مهامك بسهولة.
            </CardDescription>
          </CardHeader>
        </div>

        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الاسم الكامل</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="مثال: سالم المدير" disabled={isPending} />
                      </FormControl>
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
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@example.com" disabled={isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>كلمة المرور</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="********"
                            disabled={isPending}
                            className="pe-10"
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>

                      {/* شريط قوة كلمة المرور (واجهة فقط) */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex w-32 items-center gap-1">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1 flex-1 rounded ${i < strength ? "bg-primary" : "bg-muted"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">القوة: {strengthLabel}</span>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        استخدم مزيجًا من الأحرف الكبيرة/الصغيرة والأرقام والرموز.
                      </p>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الدور</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر دور المستخدم" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.keys(roleTranslations)
                            .filter((r) => r !== "admin")
                            .map((roleKey) => (
                              <SelectItem key={roleKey} value={roleKey}>
                                {roleTranslations[roleKey as UserRole]}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>خطأ</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                disabled={isPending}
              >
                {isPending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                إنشاء الحساب
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                  تسجيل الدخول
                </Link>
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3.5 w-3.5" />
                واجهة فقط: لا تغييرات على منطق الباك-إند — تم تحسين المظهر والمسافات والألوان فقط.
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
