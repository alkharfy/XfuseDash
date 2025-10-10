"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from 'next/link';
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth as useFirebaseAuth } from "@/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Zap } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(1, { message: "الرجاء إدخال كلمة المرور." }),
});

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const auth = useFirebaseAuth();
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "moderator@marketflow.com",
      password: "password",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    setError(null);
    startTransition(async () => {
      try {
        await signInWithEmailAndPassword(auth, values.email, values.password);
        router.push("/dashboard");
      } catch (e: any) {
        if (e.code === 'auth/invalid-credential' || e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
            setError('فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.');
        } else {
            setError('حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.');
        }
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-headline">تسجيل الدخول</CardTitle>
        <CardDescription>أدخل بياناتك للوصول إلى لوحة التحكم</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
              تسجيل الدخول
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
         <p className="px-8 text-center text-sm text-muted-foreground">
            ليس لديك حساب؟{' '}
            <Link
              href="/register"
              className="underline underline-offset-4 hover:text-primary"
            >
              إنشاء حساب
            </Link>
          </p>
      </CardFooter>
    </Card>
  );
}
