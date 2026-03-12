import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireSessionUser();

  const [vocabularyCount, dueCount, masteredCount, quizAttempts, streak] = await Promise.all([
    prisma.vocabulary.count({
      where: {
        OR: [
          { userId: user.id },
          { source: "SYSTEM" }
        ]
      }
    }),
    prisma.userVocabularyProgress.count({
      where: {
        userId: user.id,
        dueAt: {
          lte: new Date()
        }
      }
    }),
    prisma.userVocabularyProgress.count({
      where: {
        userId: user.id,
        state: "REVIEW",
        intervalDays: {
          gte: 7
        }
      }
    }),
    prisma.quizAttempt.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 5
    }),
    prisma.userStreak.findUnique({
      where: {
        userId: user.id
      }
    })
  ]);

  const averageScore = quizAttempts.length
    ? Math.round(quizAttempts.reduce((sum, item) => sum + item.score, 0) / quizAttempts.length)
    : 0;

  return NextResponse.json({
    vocabularyCount,
    dueCount,
    masteredCount,
    averageScore,
    currentStreak: streak?.currentStreak ?? 0,
    recentAttempts: quizAttempts
  });
}
