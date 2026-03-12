import { QuizMode, VocabularySource } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildCorrectAnswer, buildOptions, buildQuestionText } from "@/lib/quiz";
import { generateQuizSchema } from "@/lib/validations";

export async function POST(request: Request) {
  await requireSessionUser();
  const body = await request.json();
  const parsed = generateQuizSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quiz options" }, { status: 400 });
  }

  const vocabularies = await prisma.vocabulary.findMany({
    where: {
      OR: [
        { source: VocabularySource.SYSTEM },
        { userId: { not: null } }
      ],
      ...(parsed.data.categoryId ? { categoryId: parsed.data.categoryId } : {})
    },
    take: Math.max(parsed.data.count * 2, 8),
    orderBy: { createdAt: "desc" }
  });

  const picked = vocabularies.sort(() => Math.random() - 0.5).slice(0, parsed.data.count);
  const questions = picked.map((vocabulary) => ({
    vocabularyId: vocabulary.id,
    questionText: buildQuestionText(vocabulary, parsed.data.direction),
    correctAnswer: buildCorrectAnswer(vocabulary, parsed.data.direction),
    options: parsed.data.mode === QuizMode.MULTIPLE_CHOICE ? buildOptions(vocabularies, vocabulary, parsed.data.direction) : undefined,
    explanation: vocabulary.exampleEn || vocabulary.exampleVi || null
  }));

  return NextResponse.json({ questions });
}
