
'use server';

import { z } from 'zod';
import { summarizeMarketResearch, SummarizeMarketResearchInput } from '@/ai/flows/summarize-market-research';
import { mockUsers } from '@/lib/data';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export async function loginAction(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'البيانات المدخلة غير صالحة' };
  }
  
  const { email } = validatedFields.data;

  // This is a mock authentication. In a real app, use Firebase Auth.
  const user = mockUsers.find(u => u.email === email);
  
  if (user) {
    return { success: true, user };
  } else {
    return { error: 'فشل تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.' };
  }
}


export async function getSummaryForResearchFile(fileName: string, clientId: string) {
  try {
    // In a real app, you would get the actual file URL from Firebase Storage.
    const fileUrl = `https://mock-storage.com/${clientId}/${fileName}`;
    
    const input: SummarizeMarketResearchInput = { fileUrl };
    
    // Call the Genkit flow to get the summary
    const { summary } = await summarizeMarketResearch(input);

    if (summary) {
        return { summary };
    } else {
        return { error: 'فشل في توليد الملخص من الذكاء الاصطناعي.' };
    }

  } catch (error) {
    console.error("Error summarizing market research:", error);
    return { error: 'فشل في تلخيص الملف بسبب خطأ في الخادم.' };
  }
}
