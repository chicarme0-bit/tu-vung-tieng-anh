import { QuizStudio } from "@/components/quiz/quiz-studio";
import { demoCategories } from "@/lib/demo-data";

export const dynamic = "force-static";

export default function QuizPage() {
  return <QuizStudio categories={demoCategories} />;
}
