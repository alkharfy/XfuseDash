'use server';
/**
 * @fileOverview A Genkit flow that summarizes market research files for the creative team.
 *
 * - summarizeMarketResearchFiles - A function that handles the summarization process.
 * - SummarizeMarketResearchFilesInput - The input type for the summarizeMarketResearchFiles function.
 * - SummarizeMarketResearchFilesOutput - The return type for the summarizeMarketResearchFiles function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMarketResearchFilesInputSchema = z.object({
  fileUrl: z.string().describe('URL of the market research file to summarize.'),
});
export type SummarizeMarketResearchFilesInput = z.infer<typeof SummarizeMarketResearchFilesInputSchema>;

const SummarizeMarketResearchFilesOutputSchema = z.object({
  summary: z.string().describe('A short summary of the market research file.'),
  progress: z.string().describe('Progress of the summarization process.')
});
export type SummarizeMarketResearchFilesOutput = z.infer<typeof SummarizeMarketResearchFilesOutputSchema>;

export async function summarizeMarketResearchFiles(input: SummarizeMarketResearchFilesInput): Promise<SummarizeMarketResearchFilesOutput> {
  return summarizeMarketResearchFilesFlow(input);
}

const summarizeMarketResearchFilesPrompt = ai.definePrompt({
  name: 'summarizeMarketResearchFilesPrompt',
  input: {schema: SummarizeMarketResearchFilesInputSchema},
  output: {schema: SummarizeMarketResearchFilesOutputSchema},
  prompt: `You are an expert marketing analyst. Summarize the key findings of the following market research file.  Be concise and focus on actionable insights for a creative team.\n\nFile URL: {{{fileUrl}}}`,
});

const summarizeMarketResearchFilesFlow = ai.defineFlow(
  {
    name: 'summarizeMarketResearchFilesFlow',
    inputSchema: SummarizeMarketResearchFilesInputSchema,
    outputSchema: SummarizeMarketResearchFilesOutputSchema,
  },
  async input => {
    const {output} = await summarizeMarketResearchFilesPrompt(input);
    return {
      ...output,
      progress: 'Automatically analyzed the market research file and generated a summary.'
    } as SummarizeMarketResearchFilesOutput;
  }
);
