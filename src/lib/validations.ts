import { QuizDirection, QuizMode, ReviewResult } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2).max(50).optional().or(z.literal(""))
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const vocabularySchema = z.object({
  english: z.string().min(1),
  vietnamese: z.string().min(1),
  pronunciation: z.string().optional(),
  exampleEn: z.string().optional(),
  exampleVi: z.string().optional(),
  categoryId: z.string().optional(),
  difficulty: z.coerce.number().min(1).max(5).default(1)
});

export const reviewSubmitSchema = z.object({
  vocabularyId: z.string().min(1),
  result: z.nativeEnum(ReviewResult)
});

export const generateQuizSchema = z.object({
  direction: z.nativeEnum(QuizDirection),
  mode: z.nativeEnum(QuizMode).default(QuizMode.MULTIPLE_CHOICE),
  categoryId: z.string().optional(),
  count: z.coerce.number().min(1).max(20).default(5)
});

export const quizSubmitSchema = z.object({
  direction: z.nativeEnum(QuizDirection),
  mode: z.nativeEnum(QuizMode),
  categoryId: z.string().optional(),
  answers: z.array(
    z.object({
      vocabularyId: z.string(),
      questionText: z.string(),
      correctAnswer: z.string(),
      userAnswer: z.string().optional().default(""),
      explanation: z.string().optional()
    })
  ).min(1)
});

export const geminiKeySchema = z.object({
  apiKey: z.string().min(10)
});
