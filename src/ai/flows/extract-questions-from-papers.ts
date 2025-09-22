
'use server';
/**
 * @fileOverview An AI flow to extract questions from uploaded question papers.
 *
 * - extractQuestionsFromPapers - A function that handles the question extraction process.
 * - ExtractQuestionsInput - The input type for the function.
 * - ExtractQuestionsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractQuestionsInputSchema = z.object({
  paperDataUris: z.array(z.string()).describe("An array of question papers, each as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ExtractQuestionsInput = z.infer<typeof ExtractQuestionsInputSchema>;

const ExtractedQuestionSchema = z.object({
    id: z.string().describe("A unique identifier for the question, e.g., 'q1'."),
    text: z.string().describe("The full text of the extracted question."),
});
export type ExtractedQuestion = z.infer<typeof ExtractedQuestionSchema>;

const ExtractQuestionsOutputSchema = z.object({
  questions: z.array(ExtractedQuestionSchema).describe("An array of all questions extracted from the documents."),
});
export type ExtractQuestionsOutput = z.infer<typeof ExtractQuestionsOutputSchema>;


export async function extractQuestionsFromPapers(input: ExtractQuestionsInput): Promise<ExtractQuestionsOutput> {
  return extractQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractQuestionsPrompt',
  input: {schema: ExtractQuestionsInputSchema},
  output: {schema: ExtractQuestionsOutputSchema},
  prompt: `You are an expert AI assistant that processes educational documents. Your task is to analyze the provided document(s) and extract every single question from them.

- Identify each distinct question.
- A question may have sub-parts (e.g., 1.1, 1.2, a, b). Treat the entire parent question as one block.
- Capture the full text of each question, including any context, diagrams described in text, or sub-parts.
- Assign a unique ID to each question you find, starting with 'q1', then 'q2', and so on.
- Pay close attention to numbering to correctly separate questions.

Here are the documents:
{{#each paperDataUris}}
{{media url=this}}
---
{{/each}}
`,
});

const extractQuestionsFlow = ai.defineFlow(
  {
    name: 'extractQuestionsFlow',
    inputSchema: ExtractQuestionsInputSchema,
    outputSchema: ExtractQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
