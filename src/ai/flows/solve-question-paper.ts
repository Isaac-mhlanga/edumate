
'use server';
/**
 * @fileOverview An AI flow to solve a single question from a question paper.
 *
 * - solveQuestionPaper - A function that handles the question solving process.
 * - SolveQuestionPaperInput - The input type for the function.
 * - SolveQuestionPaperOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SolveQuestionPaperInputSchema = z.object({
    questionText: z.string().describe("The full text of the question to be solved, formatted with LaTeX for mathematical formulas."),
    diagramDescription: z.string().optional().describe("A textual description of any diagram associated with the question."),
});
export type SolveQuestionPaperInput = z.infer<typeof SolveQuestionPaperInputSchema>;

const SolveQuestionPaperOutputSchema = z.object({
  explanation: z.string().describe("A detailed, step-by-step explanation of how to arrive at the solution. This should be formatted as HTML with valid LaTeX for formulas."),
  finalAnswer: z.string().describe("The final, concise answer to the question, formatted with valid LaTeX."),
});
export type SolveQuestionPaperOutput = z.infer<typeof SolveQuestionPaperOutputSchema>;


export async function solveQuestionPaper(input: SolveQuestionPaperInput): Promise<SolveQuestionPaperOutput> {
  return solveQuestionPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveQuestionPaperPrompt',
  input: {schema: SolveQuestionPaperInputSchema},
  output: {schema: SolveQuestionPaperOutputSchema},
  prompt: `You are an expert AI tutor specializing in high school Maths and Science. Your task is to provide a comprehensive solution to the following question.

**CRITICAL INSTRUCTIONS:**
1.  **Explanation Format:** Your explanation MUST be valid HTML. Use tags like <p>, <ul>, <li>, and <strong> for clarity. Use <h4> for step headings (e.g., <h4>Step 1: Identify the knowns</h4>).
2.  **LaTeX for Formulas:** ALL mathematical formulas, variables, and symbols in both the explanation and the final answer MUST be formatted using valid LaTeX syntax. Use \\( ... \\) for inline math (e.g., \\(x^2\\)) and \\\\[ ... \\\\] for block math (e.g., \\\\[\\frac{a}{b}\\\\]).
3.  **Step-by-Step Logic:** Break down the solution into logical, easy-to-follow steps. Explain the 'why' behind each step, including the principles or formulas used.
4.  **Final Answer:** The final answer should be concise and directly answer the question asked.

**Question to Solve:**
- **Text:** {{{questionText}}}
{{#if diagramDescription}}
- **Associated Diagram:** {{{diagramDescription}}}
{{/if}}

Provide the solution now.`,
});

const solveQuestionPaperFlow = ai.defineFlow(
  {
    name: 'solveQuestionPaperFlow',
    inputSchema: SolveQuestionPaperInputSchema,
    outputSchema: SolveQuestionPaperOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);

    