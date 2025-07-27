
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-lesson.ts';
import '@/ai/flows/suggest-lessons.ts';
import '@/ai/flows/grade-quiz.ts';
import '@/ai/flows/clarify-question.ts';

    