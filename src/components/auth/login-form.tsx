"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { loginAction } from "@/app/actions";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(1, { message: "الرجاء إدخال كلمة المرور." }),
});

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const auth = useAuth();
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
      const result = await loginAction(values);
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.user) {
        await auth.login(result.user.email);
        router.push("/dashboard");
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
    </Card>
  );
}
