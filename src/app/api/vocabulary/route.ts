import { VocabularySource } from "@prisma/client";
import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vocabularySchema } from "@/lib/validations";

export async function GET() {
  const user = await requireSessionUser();
  const vocabularies = await prisma.vocabulary.findMany({
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
  });

  return NextResponse.json(vocabularies);
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const body = await request.json();
  const parsed = vocabularySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid vocabulary payload" }, { status: 400 });
  }

  const vocabulary = await prisma.vocabulary.create({
    data: {
      ...parsed.data,
      userId: user.id,
      source: VocabularySource.MANUAL
    },
    include: {
      category: true
    }
  });

  return NextResponse.json(vocabulary, { status: 201 });
}
