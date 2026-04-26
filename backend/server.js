const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Program = require("./models/Program");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/oop_lab_code_finder";

app.use(cors());
app.use(express.json({ limit: "200kb" }));

app.post("/add", async (req, res) => {
  try {
    const { title, code } = req.body;

    if (!title || !code) {
      return res.status(400).json({ message: "Title and code are required." });
    }

    const saved = await Program.create({ title: title.trim(), code });
    return res.status(201).json(saved);
  } catch (error) {
    return res.status(500).json({ message: "Failed to add code." });
  }
});

app.get("/all", async (_req, res) => {
  try {
    const programs = await Program.find({}, { title: 1, code: 1 }).sort({ title: 1 }).lean();
    return res.json(programs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch codes." });
  }
});

app.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();

    if (!q) {
      const all = await Program.find({}, { title: 1, code: 1 }).sort({ title: 1 }).lean();
      return res.json(all);
    }

    const programs = await Program.find(
      { title: { $regex: q, $options: "i" } },
      { title: 1, code: 1 }
    )
      .sort({ title: 1 })
      .lean();

    return res.json(programs);
  } catch (error) {
    return res.status(500).json({ message: "Search failed." });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
