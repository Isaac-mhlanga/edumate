
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
  videoUrl: z.string().url().describe('The public URL of the video to be analyzed.'),
  courseContext: z.string().describe('The context of the course the lesson belongs to.'),
  studentPreviousActivity: z.string().describe('The previous activity of the student in the course.'),
});
export type SummarizeLessonInput = z.infer<typeof SummarizeLessonInputSchema>;

const SummarizeLessonOutputSchema = z.object({
  summary: z.string().describe('A short, helpful summary and explanation of the video content, including tips and tricks for the concepts shown. This should be formatted as simple HTML (e.g., using <p>, <ul>, <li>, <strong>).'),
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
  prompt: `You are an expert AI Tutor for high school students. Your task is to analyze the provided video lesson and generate helpful notes and explanations.

Analyze the video content from the URL. Identify the key concepts, especially any mathematical equations, scientific diagrams, or step-by-step processes being shown.

Your output should be a concise summary that includes:
1.  A brief overview of the main topic in the video.
2.  Simple, step-by-step explanations for any problems or equations being solved.
3.  Helpful tricks or alternative ways to approach the problem.
4.  Keep the language simple and easy for a high school student to understand.

This video is from a course with the following context:
- Course: {{{courseContext}}}
- Lesson Title: {{{lessonTitle}}}
- Student's Past Activity: {{{studentPreviousActivity}}}

Please analyze the following video:
{{media url=videoUrl}}

Generate the summary now.
`, 
  config: {
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
