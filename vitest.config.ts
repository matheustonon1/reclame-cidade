import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // hashCpf precisa de uma chave - valor fixo só pra rodar os testes,
    // não usado em nenhum ambiente real.
    env: { AUTH_SECRET: "chave-de-teste-nao-usada-em-producao" },
  },
});
