
'use server';
/**
 * @fileOverview An AI flow to clarify a student's question without giving away the answer.
 *
 * - clarifyQuestion - A function that provides a hint for a quiz question.
 * - ClarifyQuestionInput - The input type for the clarifyQuestion function.
 * - ClarifyQuestionOutput - The return type for the clarifyQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const ClarifyQuestionInputSchema = z.object({
  question: z.string().describe('The quiz question the student is asking about.'),
});
export type ClarifyQuestionInput = z.infer<typeof ClarifyQuestionInputSchema>;

export const ClarifyQuestionOutputSchema = z.object({
  clarification: z.string().describe('A hint or clarification that guides the student towards the answer without revealing it directly.'),
});
export type ClarifyQuestionOutput = z.infer<typeof ClarifyQuestionOutputSchema>;


export async function clarifyQuestion(input: ClarifyQuestionInput): Promise<ClarifyQuestionOutput> {
  return clarifyQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'clarifyQuestionPrompt',
  input: {schema: ClarifyQuestionInputSchema},
  output: {schema: ClarifyQuestionOutputSchema},
  prompt: `You are an expert tutor. A student is stuck on the following quiz question and has asked for a hint.

Your task is to provide a helpful clarification or a guiding question that points the student in the right direction.

**Crucially, you must NOT give away the direct answer.** Your goal is to help them think and arrive at the solution themselves.

For example, if the question is "What is the powerhouse of the cell?", a good hint would be "Think about which organelle is responsible for generating most of the cell's supply of adenosine triphosphate (ATP)." A bad hint would be "The answer is mitochondria."

Quiz Question:
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

    