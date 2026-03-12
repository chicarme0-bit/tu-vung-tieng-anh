import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu đăng nhập không hợp lệ" }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

    const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);

    if (!matches) {
      return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 });
    }

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

    return NextResponse.json({ ok: true, message: "Đăng nhập thành công" });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return NextResponse.json({ error: "Không thể đăng nhập lúc này" }, { status: 500 });
  }
}
