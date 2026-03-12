import { ReviewSource } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getQuizReviewResult, scheduleSpacedRepetition } from "@/lib/spaced-repetition";
import { quizSubmitSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const body = await request.json();
  const parsed = quizSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid quiz submission" }, { status: 400 });
  }

  const items = parsed.data.answers.map((answer) => {
    const isCorrect = answer.correctAnswer.trim().toLowerCase() === (answer.userAnswer || "").trim().toLowerCase();

    return {
      ...answer,
      isCorrect
    };
  });

  const correctAnswers = items.filter((item) => item.isCorrect).length;
  const score = Math.round((correctAnswers / items.length) * 100);

  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      categoryId: parsed.data.categoryId,
      direction: parsed.data.direction,
      mode: parsed.data.mode,
      totalQuestions: items.length,
      correctAnswers,
      score,
      items: {
        create: items
      }
    },
    include: {
      items: true
    }
  });

  const progressRows = await prisma.userVocabularyProgress.findMany({
    where: {
      userId: user.id,
      vocabularyId: {
        in: items.map((item) => item.vocabularyId)
      }
    }
  });
  const progressMap = new Map(progressRows.map((item) => [item.vocabularyId, item]));
  const scheduledItems = items.map((item) => {
    const reviewResult = getQuizReviewResult(item.isCorrect, parsed.data.mode);
    const existingProgress = progressMap.get(item.vocabularyId) ?? null;
    const scheduled = scheduleSpacedRepetition({
      progress: existingProgress,
      result: reviewResult,
      source: ReviewSource.QUIZ
    });
    const { nextReviewLabel: _nextReviewLabel, ...persistedProgress } = scheduled;

    return {
      item,
      reviewResult,
      existingProgress,
      persistedProgress,
      scheduled
    };
  });

  await prisma.$transaction(
    scheduledItems.map(({ item, persistedProgress }) =>
      prisma.userVocabularyProgress.upsert({
        where: {
          userId_vocabularyId: {
            userId: user.id,
            vocabularyId: item.vocabularyId
          }
        },
        update: persistedProgress,
        create: {
          userId: user.id,
          vocabularyId: item.vocabularyId,
          ...persistedProgress
        }
      })
    )
  );

  await prisma.$transaction(
    scheduledItems.map(({ item, reviewResult, existingProgress, scheduled }) =>
      prisma.reviewLog.create({
        data: {
          userId: user.id,
          vocabularyId: item.vocabularyId,
          result: reviewResult,
          source: ReviewSource.QUIZ,
          stateBefore: existingProgress?.state,
          stateAfter: scheduled.state,
          easeScore: Math.round(scheduled.easeFactor * 10),
          intervalDays: scheduled.intervalDays,
          nextReviewAt: scheduled.dueAt
        }
      })
    )
  );

  await prisma.userStreak.upsert({
    where: { userId: user.id },
    update: {
      currentStreak: { increment: 1 },
      longestStreak: { increment: score >= 80 ? 1 : 0 },
      lastStudyDate: new Date()
    },
    create: {
      userId: user.id,
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: new Date()
    }
  });

  return NextResponse.json(attempt);
}
