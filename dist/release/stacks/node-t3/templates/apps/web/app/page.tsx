import { ensureSchema, getTodos } from "@repo/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureSchema();
  const todos = await getTodos();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold text-cyan-300">T3 Stack Example</h1>
      <p className="mt-2 text-slate-300">Tailwind + TypeScript + Turborepo + Drizzle ORM</p>
      <ul className="mt-6 space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <span className="font-medium">{todo.title}</span>
            <span className="ml-2 text-sm text-slate-400">{todo.done ? "done" : "open"}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
