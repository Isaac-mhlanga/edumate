'use server';
/**
 * @fileOverview A flow that automatically grades a student's quiz submission using AI.
 *
 * - gradeQuiz - A function that handles the quiz grading.
 * - GradeQuizInput - The input type for the gradeQuiz function.
 * - GradeQuizOutput - The return type for the gradeQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const QuestionAnswerSchema = z.object({
  question: z.string().describe("The quiz question."),
  correctAnswer: z.string().describe("The correct answer for the question."),
  studentAnswer: z.string().describe("The student's submitted answer for the question."),
});

const GradedQuestionSchema = z.object({
  question: z.string().describe("The original quiz question."),
  isCorrect: z.boolean().describe("Whether the student's answer was correct."),
  feedback: z.string().describe("AI-generated feedback for the student's answer, explaining why it was right or wrong."),
});

export const GradeQuizInputSchema = z.object({
  questionsAndAnswers: z.array(QuestionAnswerSchema).describe("An array of questions, their correct answers, and the student's answers."),
});
export type GradeQuizInput = z.infer<typeof GradeQuizInputSchema>;

export const GradeQuizOutputSchema = z.object({
  overallScore: z.number().describe("The student's overall score as a percentage."),
  summary: z.string().describe("A brief summary of the student's performance."),
  gradedQuestions: z.array(GradedQuestionSchema).describe("An array of the graded questions with feedback."),
});
export type GradeQuizOutput = z.infer<typeof GradeQuizOutputSchema>;


export async function gradeQuiz(input: GradeQuizInput): Promise<GradeQuizOutput> {
  return gradeQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeQuizPrompt',
  input: {schema: GradeQuizInputSchema},
  output: {schema: GradeQuizOutputSchema},
  prompt: `You are an AI teaching assistant. Your task is to grade a student's quiz submission.

For each question, compare the student's answer to the correct answer. Determine if the student's answer is correct. The answer doesn't have to be a perfect word-for-word match, but it must be semantically correct.

For each question, provide constructive feedback. If the answer is correct, briefly acknowledge it. If it is incorrect, explain the correct answer clearly.

After grading all questions, calculate the final score as a percentage and provide a brief, encouraging summary of the student's performance.

Here are the questions and answers:
{{#each questionsAndAnswers}}
- Question: {{{question}}}
  - Correct Answer: {{{correctAnswer}}}
  - Student's Answer: {{{studentAnswer}}}
{{/each}}
`,
});

const gradeQuizFlow = ai.defineFlow(
  {
    name: 'gradeQuizFlow',
    inputSchema: GradeQuizInputSchema,
    outputSchema: GradeQuizOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
