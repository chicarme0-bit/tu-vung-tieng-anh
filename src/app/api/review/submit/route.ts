import { ReviewSource } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scheduleSpacedRepetition } from "@/lib/spaced-repetition";
import { reviewSubmitSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const body = await request.json();
  const parsed = reviewSubmitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review payload" }, { status: 400 });
  }

  const existingProgress = await prisma.userVocabularyProgress.findUnique({
    where: {
      userId_vocabularyId: {
        userId: user.id,
        vocabularyId: parsed.data.vocabularyId
      }
    }
  });

  const scheduled = scheduleSpacedRepetition({
    progress: existingProgress,
    result: parsed.data.result,
    source: ReviewSource.REVIEW
  });
  const { nextReviewLabel, ...persistedProgress } = scheduled;

  const progress = await prisma.userVocabularyProgress.upsert({
    where: {
      userId_vocabularyId: {
        userId: user.id,
        vocabularyId: parsed.data.vocabularyId
      }
    },
    update: persistedProgress,
    create: {
      userId: user.id,
      vocabularyId: parsed.data.vocabularyId,
      ...persistedProgress
    }
  });

  await prisma.reviewLog.create({
    data: {
      userId: user.id,
      vocabularyId: parsed.data.vocabularyId,
      result: parsed.data.result,
      source: ReviewSource.REVIEW,
      stateBefore: existingProgress?.state,
      stateAfter: progress.state,
      easeScore: Math.round(progress.easeFactor * 10),
      intervalDays: progress.intervalDays,
      nextReviewAt: progress.dueAt
    }
  });

  await prisma.userStreak.upsert({
    where: { userId: user.id },
    update: {
      currentStreak: { increment: 1 },
      longestStreak: { increment: 1 },
      lastStudyDate: new Date()
    },
    create: {
      userId: user.id,
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: new Date()
    }
  });

  return NextResponse.json({
    ok: true,
    progress: {
      state: progress.state,
      dueAt: progress.dueAt,
      intervalDays: progress.intervalDays,
      totalReviews: progress.totalReviews,
      consecutiveCorrect: progress.consecutiveCorrect,
      lapses: progress.lapses
    },
    nextReviewLabel
  });
}
