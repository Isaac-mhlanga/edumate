'use server';
/**
 * @fileOverview An AI flow to clarify a complex topic in simple terms.
 *
 * - clarifyQuestion - A function that simplifies a given text.
 * - ClarifyQuestionInput - The input type for the function.
 * - ClarifyQuestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ClarifyQuestionInputSchema = z.object({
  question: z.string().describe('The complex text or question to be simplified.'),
});
export type ClarifyQuestionInput = z.infer<typeof ClarifyQuestionInputSchema>;

const ClarifyQuestionOutputSchema = z.object({
  clarification: z.string().describe("The simplified explanation, suitable for a beginner or a 5-year-old."),
});
export type ClarifyQuestionOutput = z.infer<typeof ClarifyQuestionOutputSchema>;

export async function clarifyQuestion(input: ClarifyQuestionInput): Promise<ClarifyQuestionOutput> {
  return clarifyQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clarifyQuestionPrompt',
  input: {schema: ClarifyQuestionInputSchema},
  output: {schema: ClarifyQuestionOutputSchema},
  prompt: `You are an expert teacher who excels at simplifying complex topics. Take the following text and explain it in the simplest terms possible, as if you were explaining it to a 5-year-old. Avoid jargon and use simple analogies.

Text to simplify:
"{{{question}}}"
`,
});

const clarifyQuestionFlow = ai.defineFlow(
  {
    name: 'clarifyQuestionFlow',
    inputSchema: ClarifyQuestionInputSchema,
    outputSchema: ClarifyQuestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
