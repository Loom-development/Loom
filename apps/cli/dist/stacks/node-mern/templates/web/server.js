import express from "express";
import { resolve } from "node:path";

const app = express();
const root = resolve(process.cwd());

app.use(express.static(root));
app.listen(5173, () => {
  process.stdout.write("MERN web listening on 5173\n");
});
