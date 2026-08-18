import { seedTodos } from "./index.js";

seedTodos()
  .then(() => {
    process.stdout.write("Seeded T3 todos\n");
    process.exit(0);
  })
  .catch((error) => {
    process.stderr.write(`${error}\n`);
    process.exit(1);
  });
