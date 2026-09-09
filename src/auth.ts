import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { hashCpf, normalizarCpf } from "@/lib/cpf";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        identificador: {},
        senha: {},
      },
      async authorize(credentials) {
        const identificador = credentials?.identificador;
        const senha = credentials?.senha;

        if (typeof identificador !== "string" || typeof senha !== "string") {
          return null;
        }

        const cpfDigitado = normalizarCpf(identificador);
        const usuario = /^\d{11}$/.test(cpfDigitado)
          ? await prisma.user.findUnique({
              where: { cpfHash: hashCpf(cpfDigitado) },
            })
          : await prisma.user.findUnique({ where: { email: identificador } });

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
          orgaoId: usuario.orgaoId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.papel = (user as { papel: typeof token.papel }).papel;
        token.orgaoId = (user as { orgaoId: string | null }).orgaoId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.papel = token.papel ?? session.user.papel;
        session.user.orgaoId = token.orgaoId ?? null;
      }
      return session;
    },
  },
});
