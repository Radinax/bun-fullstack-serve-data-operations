import type { ServeOptions } from "bun";
import { Hono } from "hono";
import homepage from "./index.html";
import api from "./api";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { applyMigrations } from "./db";

try {
  applyMigrations();
  console.info("Migrations applied successfully");
} catch (err) {
  console.error("Failed to apply migrations");
  process.exit(1);
}

const app = new Hono().use(logger()).use(secureHeaders()).route("/api", api);

export type AppType = typeof app;

export default {
  fetch: app.fetch,
  development: import.meta.env.NODE_ENV !== "production",
  static: {
    "/": homepage,
  },
} satisfies ServeOptions;
