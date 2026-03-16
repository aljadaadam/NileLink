import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";
import { rateLimit } from "./rate-limit";

/**
 * Check if user has an active subscription/trial.
 * Returns null if active, or a 403 NextResponse if expired.
 */
export async function requireActiveSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const planChosen = user.trialEndsAt !== null;

  if (!planChosen) return null; // hasn't chosen plan yet, allow

  const isTrialActive = user.trialEndsAt && user.trialEndsAt > now;
  if (isTrialActive) return null;

  const subscription = await prisma.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const isSubActive =
    subscription &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIAL") &&
    subscription.currentPeriodEnd > now;

  if (isSubActive) return null;

  return NextResponse.json(
    { error: "Subscription expired. Please renew your plan." },
    { status: 403 }
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  pages: {
    signIn: "/en/auth/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = (request as any)?.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
        const { limited } = rateLimit(`login:${ip}`, 10);
        if (limited) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) return null;

        const isValid = await compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!isValid) return null;

        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Always fetch role from DB so changes reflect immediately
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
