import express from "express";
import { resolve } from "node:path";

const app = express();
const root = resolve(process.cwd());

app.use(express.static(root));
app.listen(4200, () => {
  process.stdout.write("MEAN web listening on 4200\n");
});
