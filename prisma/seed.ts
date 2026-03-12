import { QuizDirection, QuizMode, ReviewResult, ReviewSource, ReviewState, VocabularySource } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      passwordHash,
      name: "Demo User",
      settings: {
        create: {
          dailyGoal: 10,
          quizDirectionDefault: QuizDirection.EN_TO_VI
        }
      },
      streak: {
        create: {
          currentStreak: 3,
          longestStreak: 7,
          lastStudyDate: new Date()
        }
      }
    }
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "food" },
      update: {},
      create: { name: "Food", slug: "food", description: "Daily food vocabulary" }
    }),
    prisma.category.upsert({
      where: { slug: "travel" },
      update: {},
      create: { name: "Travel", slug: "travel", description: "Travel and transportation" }
    }),
    prisma.category.upsert({
      where: { slug: "business" },
      update: {},
      create: { name: "Business", slug: "business", description: "Office and business English" }
    })
  ]);

  const seedWords = [
    {
      id: "travel-destination",
      english: "destination",
      vietnamese: "diem den",
      pronunciation: "/desti-neishn/",
      exampleEn: "Bangkok is a popular travel destination.",
      exampleVi: "Bangkok la mot diem den du lich pho bien.",
      categorySlug: "travel",
      difficulty: 2
    },
    {
      id: "business-invoice",
      english: "invoice",
      vietnamese: "hoa don",
      pronunciation: "/in-vois/",
      exampleEn: "Please send the invoice by email.",
      exampleVi: "Hay gui hoa don qua email.",
      categorySlug: "business",
      difficulty: 2
    },
    {
      id: "food-ingredient",
      english: "ingredient",
      vietnamese: "nguyen lieu",
      pronunciation: "/in-gri-di-ent/",
      exampleEn: "Fresh ingredients make the soup better.",
      exampleVi: "Nguyen lieu tuoi lam mon sup ngon hon.",
      categorySlug: "food",
      difficulty: 1
    },
    {
      id: "travel-reservation",
      english: "reservation",
      vietnamese: "dat cho",
      pronunciation: "/re-ze-vei-shn/",
      exampleEn: "I made a hotel reservation yesterday.",
      exampleVi: "Toi da dat phong khach san hom qua.",
      categorySlug: "travel",
      difficulty: 2
    },
    {
      id: "business-deadline",
      english: "deadline",
      vietnamese: "han chot",
      pronunciation: "/ded-lain/",
      exampleEn: "The project deadline is next Friday.",
      exampleVi: "Han chot du an la thu Sau tuan toi.",
      categorySlug: "business",
      difficulty: 1
    },
    {
      id: "food-dessert",
      english: "dessert",
      vietnamese: "trang mieng",
      pronunciation: "/di-zert/",
      exampleEn: "We ordered fruit for dessert.",
      exampleVi: "Chung toi goi trai cay lam mon trang mieng.",
      categorySlug: "food",
      difficulty: 1
    }
  ];

  for (const word of seedWords) {
    const category = categories.find((item) => item.slug === word.categorySlug);

    if (!category) {
      continue;
    }

    await prisma.vocabulary.upsert({
      where: { id: word.id },
      update: {},
      create: {
        id: word.id,
        english: word.english,
        vietnamese: word.vietnamese,
        pronunciation: word.pronunciation,
        exampleEn: word.exampleEn,
        exampleVi: word.exampleVi,
        difficulty: word.difficulty,
        source: VocabularySource.SYSTEM,
        categoryId: category.id
      }
    });
  }

  const existingAttempt = await prisma.quizAttempt.findFirst({
    where: {
      userId: user.id
    }
  });

  if (!existingAttempt) {
    await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        categoryId: categories[1].id,
        direction: QuizDirection.EN_TO_VI,
        mode: QuizMode.MULTIPLE_CHOICE,
        totalQuestions: 3,
        correctAnswers: 2,
        score: 67,
        items: {
          create: [
            {
              questionText: "destination",
              correctAnswer: "diem den",
              userAnswer: "diem den",
              isCorrect: true,
              vocabularyId: "travel-destination"
            },
            {
              questionText: "reservation",
              correctAnswer: "dat cho",
              userAnswer: "dat phong",
              isCorrect: false,
              vocabularyId: "travel-reservation"
            },
            {
              questionText: "ingredient",
              correctAnswer: "nguyen lieu",
              userAnswer: "nguyen lieu",
              isCorrect: true,
              vocabularyId: "food-ingredient"
            }
          ]
        }
      }
    });
  }

  await prisma.userVocabularyProgress.upsert({
    where: {
      userId_vocabularyId: {
        userId: user.id,
        vocabularyId: "travel-destination"
      }
    },
    update: {},
    create: {
      userId: user.id,
      vocabularyId: "travel-destination",
      state: ReviewState.REVIEW,
      dueAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      lastReviewedAt: new Date(Date.now() - 3 * DAY_MS),
      intervalDays: 3,
      easeFactor: 2.6,
      stability: 4.2,
      difficultyScore: 4.2,
      totalReviews: 4,
      consecutiveCorrect: 3,
      lapses: 1,
      lastResult: ReviewResult.GOOD
    }
  });

  await prisma.userVocabularyProgress.upsert({
    where: {
      userId_vocabularyId: {
        userId: user.id,
        vocabularyId: "travel-reservation"
      }
    },
    update: {},
    create: {
      userId: user.id,
      vocabularyId: "travel-reservation",
      state: ReviewState.LEARNING,
      dueAt: new Date(Date.now() - 30 * 60 * 1000),
      lastReviewedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
      intervalDays: 0.5,
      easeFactor: 2.2,
      stability: 1.1,
      difficultyScore: 5.8,
      totalReviews: 2,
      consecutiveCorrect: 1,
      lapses: 1,
      lastResult: ReviewResult.HARD
    }
  });

  const existingReview = await prisma.reviewLog.findFirst({
    where: {
      userId: user.id,
      vocabularyId: "travel-destination"
    }
  });

  if (!existingReview) {
    await prisma.reviewLog.create({
      data: {
        userId: user.id,
        vocabularyId: "travel-destination",
        result: ReviewResult.GOOD,
        source: ReviewSource.REVIEW,
        stateBefore: ReviewState.LEARNING,
        stateAfter: ReviewState.REVIEW,
        easeScore: 26,
        intervalDays: 3,
        nextReviewAt: new Date(Date.now() + 3 * DAY_MS)
      }
    });
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
