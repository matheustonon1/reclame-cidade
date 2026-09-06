import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        senha: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const senha = credentials?.senha;

        if (typeof email !== "string" || typeof senha !== "string") {
          return null;
        }

        const usuario = await prisma.user.findUnique({ where: { email } });
        if (!usuario?.senhaHash) {
          return null;
        }

        const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
        if (!senhaValida) {
          return null;
        }

        return {
          id: usuario.id,
          name: usuario.name,
          email: usuario.email,
          papel: usuario.papel,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.papel = (user as { papel: typeof token.papel }).papel;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.papel = token.papel ?? session.user.papel;
      }
      return session;
    },
  },
});
