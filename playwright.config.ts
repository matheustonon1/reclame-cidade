import { defineConfig, devices } from "@playwright/test";

// Pressupõe `docker compose up -d` (MySQL) e `npm run dev` já rodando
// em http://localhost:3000 - ver "Testes end-to-end" no README. Não usa
// `webServer` porque o app depende de configuração (.env, Gemini,
// Resend) que o Playwright não tem como provisionar sozinho.
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
