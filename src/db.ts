import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema.sql";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { resolve } from "node:path";

const migrationsFolder = resolve(import.meta.dirname, "..", "migrations");

const sqlite = new Database("sqlite.db");
sqlite.exec("PRAGMA journal_mode = WAL");

export const db = drizzle(sqlite, { schema, logger: true });

export function applyMigrations(): void {
  migrate(db, { migrationsFolder });
}
