import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import bcrypt from "bcryptjs";
import { prisma } from "~/lib/prisma.server";
import { createCookieSessionStorage } from "@remix-run/node";

export interface Admin {
  id: string;
  email: string;
  name: string | null;
  role: "admin";
}

const sessionSecret = process.env.SESSION_SECRET || "default-secret-change-in-production";

// Session Storage creation
export const sessionStorage = createCookieSessionStorage<{
  admin: Admin;
}>({
  cookie: {
    name: "__admin_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
});

export const authenticator = new Authenticator<Admin>(sessionStorage);

// Form Strategy (Email/Password) - Admin only
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    console.log('[Admin Auth] Login attempt:', { email, hasPassword: !!password });

    if (!email || !password) {
      console.log('[Admin Auth] Missing credentials');
      throw new Error("이메일과 비밀번호를 입력해주세요.");
    }

    // Admin 테이블에서만 검색
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    console.log('[Admin Auth] Admin found:', !!admin);

    if (!admin) {
      throw new Error("관리자 계정을 찾을 수 없습니다.");
    }

    const isValid = await bcrypt.compare(password, admin.password);
    console.log('[Admin Auth] Password valid:', isValid);

    if (!isValid) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: "admin" as const,
    };
  }),
  "admin-pass"
);
