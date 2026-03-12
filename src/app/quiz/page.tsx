import { QuizStudio } from "@/components/quiz/quiz-studio";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function QuizPage() {
  await requireSessionUser();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return <QuizStudio categories={categories} />;
}
