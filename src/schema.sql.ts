import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

export const $todo = sqliteTable("todo", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text().notNull(),
  completed: int({ mode: "boolean" }).notNull().default(false),
  timestamp: int({ mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const insertTodoSchema = createInsertSchema($todo);
