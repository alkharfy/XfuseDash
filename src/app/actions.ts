
'use server';

import { z } from 'zod';
import { summarizeMarketResearch, SummarizeMarketResearchInput } from '@/ai/flows/summarize-market-research';

export async function getSummaryForResearchFile(fileName: string, clientId: string) {
  try {
    // In a real app, you would get the actual file URL from Firebase Storage.
    const fileUrl = `https://firebasestorage.googleapis.com/v0/b/studio-9132074694-5b878.appspot.com/o/${clientId}%2F${encodeURIComponent(fileName)}?alt=media`;
    
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
