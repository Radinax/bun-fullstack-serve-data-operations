import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "./db";
import { $todo, insertTodoSchema } from "./schema.sql";
import { eq } from "drizzle-orm";

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
    },
  )
  .delete("/todos/:id", async (c) => {
    const todoId = c.req.param("id");
    await db.delete($todo).where(eq($todo.id, todoId));
    return c.body(null, 200);
  });

export default app;
