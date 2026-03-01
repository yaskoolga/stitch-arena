import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        if (!user.password) {
          throw new Error("Please sign in with Google");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existing = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, isBanned: true },
        });
        if (!existing) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              avatar: user.image,
            },
          });
        } else if (existing.isBanned) {
          return false; // Block banned users from signing in
        }
      } else if (user.email) {
        // Check ban status for credentials provider
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { isBanned: true },
        });
        if (dbUser?.isBanned) {
          return false; // Block banned users
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, isBanned: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.isBanned = dbUser.isBanned;
        }
      }
      if (account?.provider === "google" && user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true, isBanned: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.isBanned = dbUser.isBanned;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { isBanned?: boolean }).isBanned = token.isBanned as boolean;
      }
      return session;
    },
  },
};
