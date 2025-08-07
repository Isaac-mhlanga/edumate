'use server';
/**
 * @fileOverview An AI flow to summarize an instructor's performance.
 *
 * - summarizeInstructorPerformance - A function that generates a performance summary.
 * - SummarizeInstructorPerformanceInput - The input type for the function.
 * - SummarizeInstructorPerformanceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeInstructorPerformanceInputSchema = z.object({
  instructorName: z.string().describe('The name of the instructor.'),
  totalStudents: z.number().describe('The total number of unique students enrolled in the instructor\'s courses.'),
  totalCourses: z.number().describe('The total number of courses the instructor has created.'),
  totalEarnings: z.number().describe('The total earnings of the instructor in Rand (R).'),
  pendingAssignments: z.number().describe('The number of assignments currently pending review.'),
  courseTitles: z.array(z.string()).describe('A list of the titles of the courses offered by the instructor.'),
});
export type SummarizeInstructorPerformanceInput = z.infer<typeof SummarizeInstructorPerformanceInputSchema>;

const SummarizeInstructorPerformanceOutputSchema = z.object({
  summary: z.string().describe('A concise, encouraging, and insightful summary of the instructor\'s performance based on the provided data. It should highlight successes and gently point towards areas of focus, like pending assignments.'),
});
export type SummarizeInstructorPerformanceOutput = z.infer<typeof SummarizeInstructorPerformanceOutputSchema>;

export async function summarizeInstructorPerformance(input: SummarizeInstructorPerformanceInput): Promise<SummarizeInstructorPerformanceOutput> {
  return summarizeInstructorPerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeInstructorPerformancePrompt',
  input: {schema: SummarizeInstructorPerformanceInputSchema},
  output: {schema: SummarizeInstructorPerformanceOutputSchema},
  prompt: `You are an expert business analyst and motivational coach for online educators. Your task is to provide a brief, insightful, and encouraging summary of an instructor's performance based on the data provided.

Keep the tone positive and constructive. Highlight achievements and gently guide their attention to important tasks.

Instructor Name: {{{instructorName}}}
Total Students: {{{totalStudents}}}
Total Courses: {{{totalCourses}}}
Total Earnings: R {{{totalEarnings}}}
Pending Assignments: {{{pendingAssignments}}}
Course Titles:
{{#each courseTitles}}
- {{{this}}}
{{/each}}

Generate a summary that covers their reach (students, courses), financial success, and operational tasks (pending assignments). Address the instructor directly by their name.
`,
});

const summarizeInstructorPerformanceFlow = ai.defineFlow(
  {
    name: 'summarizeInstructorPerformanceFlow',
    inputSchema: SummarizeInstructorPerformanceInputSchema,
    outputSchema: SummarizeInstructorPerformanceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
