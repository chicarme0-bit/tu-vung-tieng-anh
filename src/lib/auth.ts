import { prisma } from "@/lib/prisma";

const GUEST_EMAIL = "guest@tvta.local";
const GUEST_PASSWORD_HASH = "guest-mode-disabled";

async function ensureGuestUser() {
  try {
    let user = await prisma.user.findUnique({
      where: { email: GUEST_EMAIL }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: GUEST_EMAIL,
          passwordHash: GUEST_PASSWORD_HASH,
          name: "Khách"
        }
      });
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

    return prisma.user.findUnique({
      where: { id: user.id },
      include: {
        settings: true,
        streak: true
      }
    });
  } catch (error) {
    console.error("GUEST_USER_ERROR", error);

    const fallbackUser = await prisma.user.findFirst({
      include: {
        settings: true,
        streak: true
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return fallbackUser;
  }
}

export async function createSession() {
  return null;
}

export async function clearSession() {
  return null;
}

export async function getSessionUser() {
  return ensureGuestUser();
}

export async function requireSessionUser() {
  const user = await ensureGuestUser();

  if (!user) {
    throw new Error("Không thể khởi tạo người dùng mặc định");
  }

  return user;
}
