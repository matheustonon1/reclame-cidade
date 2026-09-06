import type { Papel } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      papel: Papel;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    papel?: Papel;
  }
}
