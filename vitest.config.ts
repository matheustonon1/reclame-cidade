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
    // e2e/*.spec.ts são testes do Playwright (npm run test:e2e), não do
    // Vitest - sem isso, o glob padrão do Vitest tenta rodar os dois
    // como se fossem testes unitários e quebra em test.afterAll().
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
