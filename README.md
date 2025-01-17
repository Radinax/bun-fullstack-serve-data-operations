# bun-fullstack

Made this to test the full-stack of Bun:

https://bun.sh/docs/bundler/fullstack

To install dependencies:

```bash
bun install
```

To run initial migrations:

```bash
bun drizzle-migration
```

To run:

```bash
bun run server
```

To run drizzle studio:

```bash
bun drizzle-studio
```

If it doesn't run, be sure to have bun version `1.1.45`

## Loop

Create DB Schema in `schema.sql.ts`:

```javascript
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
```

Create the routes in `api.ts`:

```javascript
const app = new Hono()
  .get("/todos", async (c) => {
    const todos = await db.query.$todo.findMany({
      orderBy(fields, operators) {
        return operators.desc(fields.timestamp);
      },
    });
    return c.json(todos);
  })
  .post("/todos", zValidator("json", insertTodoSchema), async (c) => {
    const data = c.req.valid("json");
    const [todo] = await db.insert($todo).values(data).returning();
    return c.json(todo);
  })
  .patch(
    "/todos/:id",
    zValidator("json", insertTodoSchema.partial()),
    async (c) => {
      const todoId = c.req.param("id");
      const data = c.req.valid("json");
      const [todo] = await db
        .update($todo)
        .set(data)
        .where(eq($todo.id, todoId))
        .returning();
      return c.json(todo);
    }
  )
  .delete("/todos/:id", async (c) => {
    const todoId = c.req.param("id");
    await db.delete($todo).where(eq($todo.id, todoId));
    return c.body(null, 200);
  });
```

Create Frontend in `app.tsx` and finally serve with Bun in `index.ts`.

```javascript
export default {
  fetch: app.fetch,
  development: import.meta.env.NODE_ENV !== "production",
  static: {
    "/": homepage,
  },
} satisfies ServeOptions;
```

**Made by Engineer Adrian Beria**
