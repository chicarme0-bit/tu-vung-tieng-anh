import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid registration data" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        name: parsed.data.name || null,
        settings: {
          create: {}
        },
        streak: {
          create: {}
        }
      }
    });

    await createSession(user.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
