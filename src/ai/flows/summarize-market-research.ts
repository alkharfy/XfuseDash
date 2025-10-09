'use server';
/**
 * @fileOverview A Genkit flow that summarizes market research files for the creative team.
 *
 * - summarizeMarketResearch - A function that handles the summarization process.
 * - SummarizeMarketResearchInput - The input type for the summarizeMarketResearch function.
 * - SummarizeMarketResearchOutput - The return type for the summarizeMarketResearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMarketResearchInputSchema = z.object({
  fileUrl: z.string().describe('URL of the market research file to summarize.'),
});
export type SummarizeMarketResearchInput = z.infer<typeof SummarizeMarketResearchInputSchema>;

const SummarizeMarketResearchOutputSchema = z.object({
  summary: z.string().describe('A short summary of the market research file.'),
  progress: z.string().describe('Progress of the summarization process.')
});
export type SummarizeMarketResearchOutput = z.infer<typeof SummarizeMarketResearchOutputSchema>;

export async function summarizeMarketResearch(input: SummarizeMarketResearchInput): Promise<SummarizeMarketResearchOutput> {
  return summarizeMarketResearchFlow(input);
}

const summarizeMarketResearchPrompt = ai.definePrompt({
  name: 'summarizeMarketResearchPrompt',
  input: {schema: SummarizeMarketResearchInputSchema},
  output: {schema: SummarizeMarketResearchOutputSchema},
  prompt: `You are an expert marketing analyst. Summarize the key findings of the following market research file.  Be concise and focus on actionable insights for a creative team.

File URL: {{{fileUrl}}}`,
});

const summarizeMarketResearchFlow = ai.defineFlow(
  {
    name: 'summarizeMarketResearchFlow',
    inputSchema: SummarizeMarketResearchInputSchema,
    outputSchema: SummarizeMarketResearchOutputSchema,
  },
  async input => {
    const {output} = await summarizeMarketResearchPrompt(input);
    return {
      ...output,
      progress: 'Generated a short summary of the market research file.'
    } as SummarizeMarketResearchOutput;
  }
);
