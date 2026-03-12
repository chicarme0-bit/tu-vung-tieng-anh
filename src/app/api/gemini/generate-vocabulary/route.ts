import { VocabularySource } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireSessionUser } from "@/lib/auth";
import { generateVocabularyWithGemini } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  topic: z.string().min(2),
  amount: z.coerce.number().min(1).max(20).default(5),
  categoryId: z.string().optional()
});

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generation request" }, { status: 400 });
  }

  const settings = await prisma.userSetting.findUnique({
    where: { userId: user.id }
  });

  if (!settings?.geminiApiKeyEncrypted) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 400 });
  }

  try {
    const generated = await generateVocabularyWithGemini({
      encryptedApiKey: settings.geminiApiKeyEncrypted,
      topic: parsed.data.topic,
      amount: parsed.data.amount
    });

    const records = await Promise.all(
      generated.map((item: Record<string, unknown>) =>
        prisma.vocabulary.create({
          data: {
            userId: user.id,
            categoryId: parsed.data.categoryId,
            english: String(item.english || ""),
            vietnamese: String(item.vietnamese || ""),
            pronunciation: item.pronunciation ? String(item.pronunciation) : null,
            exampleEn: item.exampleEn ? String(item.exampleEn) : null,
            exampleVi: item.exampleVi ? String(item.exampleVi) : null,
            difficulty: Number(item.difficulty || 1),
            source: VocabularySource.GEMINI
          }
        })
      )
    );

    return NextResponse.json({ items: records });
  } catch {
    return NextResponse.json({ error: "Gemini generation failed" }, { status: 502 });
  }
}
