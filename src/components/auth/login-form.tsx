"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { useAuth as useFirebaseAuth } from "@/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(1, { message: "الرجاء إدخال كلمة المرور." }),
});

const resetPasswordSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح لإعادة التعيين." }),
});

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResetting, startResetTransition] = useTransition();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const auth = useFirebaseAuth();
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "moderator@marketflow.com",
      password: "password",
    },
  });

  const resetForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
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

  const onResetSubmit = (values: z.infer<typeof resetPasswordSchema>) => {
    startResetTransition(async () => {
      try {
        await sendPasswordResetEmail(auth, values.email);
        toast({
          title: "تم إرسال الرابط",
          description: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.",
        });
        setIsResetDialogOpen(false);
        resetForm.reset();
      } catch (e: any) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل إرسال البريد. تأكد من أن البريد الإلكتروني مسجل.",
        });
      }
    });
  };

  return (
    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="font-headline">تسجيل الدخول</CardTitle>
          <CardDescription>أدخل بياناتك للوصول إلى لوحة التحكم</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={loginForm.control}
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
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="********" disabled={isPending} />
                      </FormControl>
                       <div className="text-right">
                         <DialogTrigger asChild>
                            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                                نسيت كلمة المرور؟
                            </Button>
                         </DialogTrigger>
                       </div>
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
      
      <DialogContent>
          <DialogHeader>
              <DialogTitle>إعادة تعيين كلمة المرور</DialogTitle>
              <DialogDescription>أدخل بريدك الإلكتروني المسجل لإرسال رابط إعادة التعيين.</DialogDescription>
          </DialogHeader>
          <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
                  <FormField
                      control={resetForm.control}
                      name="email"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>البريد الإلكتروني</FormLabel>
                              <FormControl>
                                  <Input {...field} type="email" placeholder="email@example.com" disabled={isResetting} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
                  <DialogFooter>
                      <DialogClose asChild>
                          <Button type="button" variant="ghost">إلغاء</Button>
                      </DialogClose>
                      <Button type="submit" disabled={isResetting}>
                          {isResetting && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
                          إرسال الرابط
                      </Button>
                  </DialogFooter>
              </form>
          </Form>
      </DialogContent>
    </Dialog>
  );
}