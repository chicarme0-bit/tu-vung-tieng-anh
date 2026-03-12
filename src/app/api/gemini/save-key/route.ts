import { NextResponse } from "next/server";

import { requireSessionUser } from "@/lib/auth";
import { encryptSecret, maskSecret } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { geminiKeySchema } from "@/lib/validations";

export async function POST(request: Request) {
  const user = await requireSessionUser();
  const body = await request.json();
  const parsed = geminiKeySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
  }

  const encrypted = encryptSecret(parsed.data.apiKey);
  await prisma.userSetting.upsert({
    where: { userId: user.id },
    update: {
      geminiApiKeyEncrypted: encrypted,
      geminiKeyHint: maskSecret(parsed.data.apiKey)
    },
    create: {
      userId: user.id,
      geminiApiKeyEncrypted: encrypted,
      geminiKeyHint: maskSecret(parsed.data.apiKey)
    }
  });

  return NextResponse.json({ ok: true });
}
