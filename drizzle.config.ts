import { defineConfig } from "drizzle-kit";

export default defineConfig({
  verbose: true,
  dialect: "sqlite",
  schema: "**/*.sql.ts",
  out: "migrations",
});
