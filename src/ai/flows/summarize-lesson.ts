'use server';

/**
 * @fileOverview Generates a summary of a video lesson using AI.
 *
 * - summarizeLesson - A function that summarizes the lesson.
 * - SummarizeLessonInput - The input type for the summarizeLesson function.
 * - SummarizeLessonOutput - The return type for the summarizeLesson function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeLessonInputSchema = z.object({
  lessonTitle: z.string().describe('The title of the video lesson.'),
  lessonDescription: z.string().describe('The description of the video lesson.'),
  transcript: z.string().describe('The transcript of the video lesson.'),
  courseContext: z.string().describe('The context of the course the lesson belongs to.'),
  studentPreviousActivity: z.string().describe('The previous activity of the student in the course.'),
});
export type SummarizeLessonInput = z.infer<typeof SummarizeLessonInputSchema>;

const SummarizeLessonOutputSchema = z.object({
  summary: z.string().describe('A short summary of the video lesson.'),
  progress: z.string().describe('Shows the summarization progress')
});
export type SummarizeLessonOutput = z.infer<typeof SummarizeLessonOutputSchema>;

export async function summarizeLesson(input: SummarizeLessonInput): Promise<SummarizeLessonOutput> {
  return summarizeLessonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeLessonPrompt',
  input: {schema: SummarizeLessonInputSchema},
  output: {schema: SummarizeLessonOutputSchema},
  prompt: `You are an AI assistant that summarizes video lessons for students. You will receive the lesson title, description, transcript, course context, and the student's previous activity in the course.

  Based on all of this information, provide a concise summary of the video lesson. The summary should give the student a quick understanding of the lesson's relevance to their learning needs. Keep the summary very short.

  Lesson Title: {{{lessonTitle}}}
  Lesson Description: {{{lessonDescription}}}
  Transcript: {{{transcript}}}
  Course Context: {{{courseContext}}}
  Student Previous Activity: {{{studentPreviousActivity}}}

  Summary:`, config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const summarizeLessonFlow = ai.defineFlow(
  {
    name: 'summarizeLessonFlow',
    inputSchema: SummarizeLessonInputSchema,
    outputSchema: SummarizeLessonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      ...output!,
      progress: 'Generated a concise summary of the video lesson.',
    };
  }
);
