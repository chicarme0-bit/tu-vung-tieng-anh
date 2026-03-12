import { VocabularyManager } from "@/components/vocabulary/vocabulary-manager";
import { demoCategories, demoVocabulary } from "@/lib/demo-data";

export const dynamic = "force-static";

export default function VocabularyPage() {
  return <VocabularyManager initialItems={demoVocabulary} categories={demoCategories} />;
}
