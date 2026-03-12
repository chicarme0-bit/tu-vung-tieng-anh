import { VocabularySource } from "@prisma/client";

import { ReviewTrainer } from "@/components/review/review-trainer";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ReviewPage() {
  const user = await requireSessionUser();
  const dueProgress = await prisma.userVocabularyProgress.findMany({
    where: {
      userId: user.id,
      dueAt: {
        lte: new Date()
      }
    },
    include: {
      vocabulary: true
    },
    orderBy: [
      { dueAt: "asc" },
      { intervalDays: "asc" }
    ],
    take: 12
  });

  const dueVocabularyIds = dueProgress.map((item) => item.vocabularyId);
  const freshWords = dueProgress.length < 12
    ? await prisma.vocabulary.findMany({
        where: {
          id: { notIn: dueVocabularyIds },
          OR: [
            { userId: user.id },
            { source: VocabularySource.SYSTEM }
          ],
          progressRecords: {
            none: {
              userId: user.id
            }
          }
        },
        orderBy: { createdAt: "desc" },
        take: 12 - dueProgress.length
      })
    : [];

  const items = [
    ...dueProgress.map((item) => ({
      id: item.vocabulary.id,
      english: item.vocabulary.english,
      vietnamese: item.vocabulary.vietnamese,
      pronunciation: item.vocabulary.pronunciation,
      exampleEn: item.vocabulary.exampleEn,
      exampleVi: item.vocabulary.exampleVi,
      state: item.state,
      dueAt: item.dueAt.toISOString(),
      intervalDays: item.intervalDays,
      totalReviews: item.totalReviews,
      consecutiveCorrect: item.consecutiveCorrect,
      lapses: item.lapses,
      isDue: true
    })),
    ...freshWords.map((item) => ({
      id: item.id,
      english: item.english,
      vietnamese: item.vietnamese,
      pronunciation: item.pronunciation,
      exampleEn: item.exampleEn,
      exampleVi: item.exampleVi,
      state: "NEW",
      dueAt: new Date().toISOString(),
      intervalDays: 0,
      totalReviews: 0,
      consecutiveCorrect: 0,
      lapses: 0,
      isDue: false
    }))
  ];

  return <ReviewTrainer items={items} />;
}
