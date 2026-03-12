import { VocabularySource } from "@prisma/client";

import { VocabularyManager } from "@/components/vocabulary/vocabulary-manager";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function VocabularyPage() {
  const user = await requireSessionUser();
  const [items, categories] = await Promise.all([
    prisma.vocabulary.findMany({
      where: {
        OR: [
          { userId: user.id },
          { source: VocabularySource.SYSTEM }
        ]
      },
      include: {
        category: true
      },
      orderBy: {
        createdAt: "desc"
      }
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } })
  ]);

  return <VocabularyManager initialItems={items} categories={categories} />;
}
