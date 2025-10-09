"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth, useFirestore } from "@/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { UserRole } from "@/lib/types";

const registerSchema = z.object({
  name: z.string().min(3, { message: "يجب أن يكون الاسم 3 أحرف على الأقل." }),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(6, { message: "يجب أن تكون كلمة المرور 6 أحرف على الأقل." }),
  role: z.enum(['admin', 'moderator', 'pr', 'market_researcher', 'creative', 'content'], {
    errorMap: () => ({ message: 'الرجاء اختيار دور صحيح.' })
  }),
});

const roleTranslations: Record<UserRole, string> = {
    admin: 'مدير',
    moderator: 'مشرف',
    pr: 'علاقات عامة',
    market_researcher: 'باحث سوق',
    creative: 'مبدع',
    content: 'محتوى'
};

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
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

        // Add user to Firestore
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
        if (e.code === 'auth/email-already-in-use') {
            setError('هذا البريد الإلكتروني مستخدم بالفعل.');
        } else if (e.code === 'auth/weak-password') {
            setError('كلمة المرور ضعيفة جداً.');
        } else {
            setError('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.');
            console.error(e);
        }
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline">إنشاء حساب</CardTitle>
        <CardDescription>أدخل بياناتك لإنشاء حساب جديد</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
                  <FormItem>
                    <FormLabel>كلمة المرور</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" placeholder="********" disabled={isPending} />
                    </FormControl>
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
                        {Object.keys(roleTranslations).map(roleKey => (
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

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
              إنشاء الحساب
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
