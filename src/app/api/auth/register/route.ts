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
      return NextResponse.json({ error: "Dữ liệu đăng ký không hợp lệ" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email này đã được sử dụng" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: parsed.data.name?.trim() || null
      }
    });

    await prisma.userSetting.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });

    await prisma.userStreak.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id }
    });

    await createSession(user.id);

    return NextResponse.json({ ok: true, message: "Tạo tài khoản thành công" });
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return NextResponse.json({ error: "Không thể tạo tài khoản lúc này" }, { status: 500 });
  }
}
