
'use server';
/**
 * @fileOverview An AI flow to solve a question paper and generate study notes.
 *
 * - solveQuestionPaper - Solves a paper, provides explanations, and generates notes.
 * - SolveQuestionPaperInput - The input type for the function.
 * - SolveQuestionPaperOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SolveQuestionPaperInputSchema = z.object({
  paperDataUri: z
    .string()
    .describe(
      "A question paper document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
    subject: z.string().optional().describe("The subject of the paper, e.g., 'Maths' or 'Physical Sciences'."),
    grade: z.string().optional().describe("The grade level for the paper, e.g., '12'."),
});
export type SolveQuestionPaperInput = z.infer<typeof SolveQuestionPaperInputSchema>;

const SolvedQuestionSchema = z.object({
    questionText: z.string().describe("The full text of the question, with all mathematical formulas formatted as LaTeX."),
    detailedSolution: z.string().describe("A detailed, step-by-step solution to the question. All mathematical formulas must be formatted as LaTeX."),
    explanation: z.string().describe("A clear explanation of the concepts, formulas, and reasoning used to arrive at the solution."),
});

const SolveQuestionPaperOutputSchema = z.object({
  solvedQuestions: z.array(SolvedQuestionSchema).describe("An array of all questions found in the paper, each with its solution and explanation."),
  studyNotes: z.string().describe("Comprehensive, well-structured study notes based on the topics and solutions from the paper. This should be formatted in Markdown, including headings, lists, and bold text. All mathematical formulas must be formatted as LaTeX."),
});
export type SolveQuestionPaperOutput = z.infer<typeof SolveQuestionPaperOutputSchema>;

export async function solveQuestionPaper(input: SolveQuestionPaperInput): Promise<SolveQuestionPaperOutput> {
  return solveQuestionPaperFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveQuestionPaperPrompt',
  input: { schema: SolveQuestionPaperInputSchema },
  output: { schema: SolveQuestionPaperOutputSchema },
  prompt: `You are an expert educator and problem solver for {{subject}} at Grade {{grade}} level. Your task is to meticulously analyze the provided question paper and generate a complete solution set and a set of study notes.

**Instructions:**

1.  **Identify All Questions:** Go through the entire document and identify every single question, including sub-parts.
2.  **Solve Each Question:** For each question, provide a detailed, step-by-step solution. Show all your work and calculations clearly.
3.  **Explain the Solution:** After each solution, provide a thorough explanation. Describe the underlying principles, the formulas used, and why each step was taken. Your explanation should be clear enough for a student to learn from it.
4.  **Generate Study Notes:** After solving all questions, synthesize the information into a comprehensive set of study notes. The notes should cover all the key topics, concepts, and formulas encountered in the paper. Structure the notes logically with Markdown (headings, lists, bold text) for readability.
5.  **Format Mathematics:** **CRITICAL:** All mathematical symbols, variables, and equations in the question text, solutions, and study notes **MUST** be formatted using LaTeX syntax (e.g., \\(x^2 + y^2 = r^2\\), \\(\\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}\\)).

**Document to Process:**
{{media url=paperDataUri}}
`,
});

const solveQuestionPaperFlow = ai.defineFlow(
  {
    name: 'solveQuestionPaperFlow',
    inputSchema: SolveQuestionPaperInputSchema,
    outputSchema: SolveQuestionPaperOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
