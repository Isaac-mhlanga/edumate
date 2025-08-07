
'use server';
/**
 * @fileOverview An AI flow to create a calendar event from a natural language prompt.
 *
 * - createCalendarEvent - A function that parses a prompt and returns structured event data.
 * - CreateCalendarEventInput - The input type for the function.
 * - CreateCalendarEventOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateCalendarEventInputSchema = z.object({
  prompt: z.string().describe('The natural language text describing the event to be created. It should include details like title, date, time, and duration.'),
});
export type CreateCalendarEventInput = z.infer<typeof CreateCalendarEventInputSchema>;

const CreateCalendarEventOutputSchema = z.object({
  title: z.string().describe('The title of the event.'),
  start: z.string().describe('The start date and time of the event in ISO 8601 format (e.g., YYYY-MM-DDTHH:mm:ss).'),
  end: z.string().optional().describe('The end date and time of the event in ISO 8601 format. This is optional.'),
  allDay: z.boolean().describe('Whether the event is an all-day event.'),
});
export type CreateCalendarEventOutput = z.infer<typeof CreateCalendarEventOutputSchema>;

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CreateCalendarEventOutput> {
  return createCalendarEventFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createCalendarEventPrompt',
  input: { schema: CreateCalendarEventInputSchema },
  output: { schema: CreateCalendarEventOutputSchema },
  system: `You are an intelligent scheduling assistant. Your task is to parse a user's natural language prompt and extract structured information to create a calendar event.

- Today's date is ${new Date().toDateString()}.
- You must determine the event's title, start time, and end time.
- Dates and times must be converted to a full ISO 8601 format (YYYY-MM-DDTHH:mm:ss).
- If no year is specified, assume the current year.
- If an end time or duration is not provided, you can leave the 'end' field empty.
- Determine if it's an all-day event. If no specific time is mentioned (e.g., "Team offsite on Friday"), set allDay to true.

User Prompt:
"{{{prompt}}}"
`,
});

const createCalendarEventFlow = ai.defineFlow(
  {
    name: 'createCalendarEventFlow',
    inputSchema: CreateCalendarEventInputSchema,
    outputSchema: CreateCalendarEventOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
