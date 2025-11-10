
import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-lesson.ts';
import '@/ai/flows/suggest-lessons.ts';
import '@/ai/flows/grade-quiz.ts';
import '@/ai/flows/summarize-instructor-performance.ts';
import '@/ai/flows/create-calendar-event.ts';
import '@/ai/flows/extract-questions-from-papers.ts';
import '@/ai/flows/solve-question-paper.ts';
import '@/ai/flows/clarify-question.ts';
    
