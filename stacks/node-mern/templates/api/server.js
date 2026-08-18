import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());

const mongoUri = process.env.MONGO_URI ?? "mongodb://mongo:27017";
const mongoDb = process.env.MONGO_DB ?? "mern";
const client = new MongoClient(mongoUri);

async function ensureSeed() {
  await client.connect();
  const db = client.db(mongoDb);
  const count = await db.collection("todos").countDocuments();
  if (count === 0) {
    await db.collection("todos").insertMany([
      { title: "React client", completed: false },
      { title: "Express API", completed: true },
      { title: "MongoDB persistence", completed: true }
    ]);
  }
}

app.get("/health", (_req, res) => {
  res.json({ stack: "MERN", status: "ok" });
});

app.get("/todos", async (_req, res) => {
  const db = client.db(mongoDb);
  const todos = await db.collection("todos").find({}).toArray();
  res.json(todos);
});

ensureSeed()
  .then(() => {
    app.listen(3002, () => {
      process.stdout.write("MERN API listening on 3002\n");
    });
  })
  .catch((error) => {
    process.stderr.write(`${error}\n`);
    process.exit(1);
  });
