'use server';
/**
 * @fileOverview A Genkit flow that summarizes market research files for the creative team.
 *
 * - summarize - A function that handles the summarization process.
 * - SummarizeInput - The input type for the summarize function.
 * - SummarizeOutput - The return type for the summarize function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInputSchema = z.object({
  fileUrl: z.string().describe('URL of the market research file to summarize.'),
});
export type SummarizeInput = z.infer<typeof SummarizeInputSchema>;

const SummarizeOutputSchema = z.object({
  summary: z.string().describe('A short summary of the market research file.'),
  progress: z.string().describe('Progress of the summarization process.')
});
export type SummarizeOutput = z.infer<typeof SummarizeOutputSchema>;

export async function summarize(input: SummarizeInput): Promise<SummarizeOutput> {
  return summarizeFlow(input);
}

const summarizePrompt = ai.definePrompt({
  name: 'summarizePrompt',
  input: {schema: SummarizeInputSchema},
  output: {schema: SummarizeOutputSchema},
  prompt: `You are an expert marketing analyst. Summarize the key findings of the following market research file. Be concise and focus on actionable insights for a creative team.

File URL: {{{fileUrl}}}`,
});

const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeFlow',
    inputSchema: SummarizeInputSchema,
    outputSchema: SummarizeOutputSchema,
  },
  async input => {
    const {output} = await summarizePrompt(input);
    return {
      ...output,
      progress: 'Generated a short summary of the market research file.'
    } as SummarizeOutput;
  }
);
