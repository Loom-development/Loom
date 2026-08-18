import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";

const app = express();
app.use(cors());

const mongoUri = process.env.MONGO_URI ?? "mongodb://mongo:27017";
const mongoDb = process.env.MONGO_DB ?? "mean";
const client = new MongoClient(mongoUri);

async function ensureSeed() {
  await client.connect();
  const db = client.db(mongoDb);
  const count = await db.collection("items").countDocuments();
  if (count === 0) {
    await db.collection("items").insertMany([
      { name: "Angular UI", done: false },
      { name: "Express API", done: true },
      { name: "Mongo storage", done: true }
    ]);
  }
}

app.get("/health", (_req, res) => {
  res.json({ stack: "MEAN", status: "ok" });
});

app.get("/items", async (_req, res) => {
  const db = client.db(mongoDb);
  const items = await db.collection("items").find({}).toArray();
  res.json(items);
});

ensureSeed()
  .then(() => {
    app.listen(3001, () => {
      process.stdout.write("MEAN API listening on 3001\n");
    });
  })
  .catch((error) => {
    process.stderr.write(`${error}\n`);
    process.exit(1);
  });
