"use client";

import { RegisterForm } from "@/components/auth/register-form";
import { Zap } from "lucide-react";
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex items-center gap-2 text-2xl font-bold text-primary">
                <Zap className="h-8 w-8" />
                <h1 className="font-headline text-3xl">xfuse</h1>
            </div>
          <p className="text-muted-foreground">إنشاء حساب جديد في لوحة التحكم</p>
        </div>
        <RegisterForm />
         <p className="px-8 text-center text-sm text-muted-foreground mt-4">
            لديك حساب بالفعل؟{' '}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              تسجيل الدخول
            </Link>
          </p>
      </div>
    </div>
  );
}
