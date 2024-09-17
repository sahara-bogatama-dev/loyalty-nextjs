import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers";
import { ZodError } from "zod";
import { signInSchema } from "@/lib/zod";
import { userLogin } from "@/controller/login/login.db";

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (c): Promise<any> => {
      if (c === null) return null;
      try {
        const { email, password } = await signInSchema.parseAsync({
          email: c?.email,
          password: c?.password,
        });

        const user = await userLogin({ email, password });

        if (user) {
          return { id: user.id, name: user.name, email: user.email };
        } else {
          throw new Error("User not found");
        }
      } catch (error: any) {
        if (error instanceof ZodError) {
          // Return `null` to indicate that the credentials are invalid
          throw new Error("Some thing wrong...");
        } else {
          throw new Error(error);
        }
      }
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: {
    strategy: "jwt",
    maxAge: 1 * 24 * 60 * 60, // 1 day
  },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  pages: { signIn: "/" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // User is available during sign-in
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig);
