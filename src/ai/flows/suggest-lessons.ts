// src/ai/flows/suggest-lessons.ts
'use server';
/**
 * @fileOverview A flow that suggests relevant lessons based on a student's past activity.
 *
 * - suggestLessons - A function that suggests relevant lessons.
 * - SuggestLessonsInput - The input type for the suggestLessons function.
 * - SuggestLessonsOutput - The return type for the suggestLessons function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLessonsInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  courseContext: z.string().describe('The context of the course the student is taking.'),
  previousActivity: z.array(z.string()).describe('A list of the student\'s previous activity (e.g. lessons watched, assignments completed).'),
});
export type SuggestLessonsInput = z.infer<typeof SuggestLessonsInputSchema>;

const SuggestLessonsOutputSchema = z.object({
  suggestedLessons: z.array(z.string()).describe('A list of suggested lessons (titles or IDs) for the student to watch next, based on their past activity and the course context.'),
});
export type SuggestLessonsOutput = z.infer<typeof SuggestLessonsOutputSchema>;

export async function suggestLessons(input: SuggestLessonsInput): Promise<SuggestLessonsOutput> {
  return suggestLessonsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLessonsPrompt',
  input: {schema: SuggestLessonsInputSchema},
  output: {schema: SuggestLessonsOutputSchema},
  prompt: `You are an AI assistant designed to suggest relevant lessons to students based on their past activity and the course context.

Given the following student ID, course context, and previous activity, suggest a list of lessons that the student should watch next.

Student ID: {{{studentId}}}
Course Context: {{{courseContext}}}
Previous Activity:
{{#each previousActivity}}
- {{{this}}}
{{/each}}

Suggested Lessons:`,
});

const suggestLessonsFlow = ai.defineFlow(
  {
    name: 'suggestLessonsFlow',
    inputSchema: SuggestLessonsInputSchema,
    outputSchema: SuggestLessonsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
