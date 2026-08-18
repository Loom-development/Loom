import { boolean, integer, pgTable, serial, text } from "drizzle-orm/pg-core";

export const todos = pgTable("todos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: integer("created_at").notNull()
});

export type Todo = typeof todos.$inferSelect;
