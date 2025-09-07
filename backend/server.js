const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, "data.json");

// helper to read/write
function readData(){
  try {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return { tasks: [], expenses: [] };
  }
}
function writeData(data){
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

// initialize file if missing
if(!fs.existsSync(DATA_PATH)){
  writeData({ tasks: [], expenses: [] });
}

/* ---------- Tasks API ---------- */
// GET /api/tasks
app.get("/api/tasks", (req, res) => {
  const data = readData();
  res.json(data.tasks);
});

// POST /api/tasks { title }
app.post("/api/tasks", (req, res) => {
  const { title } = req.body;
  if(!title) return res.status(400).json({ error: "Title required" });

  const data = readData();
  const t = { id: uuidv4(), title: String(title), completed: false, createdAt: new Date() };
  data.tasks.unshift(t);
  writeData(data);
  res.json(t);
});

// DELETE /api/tasks/:id
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const data = readData();
  data.tasks = data.tasks.filter(t => t.id !== id);
  writeData(data);
  res.json({ success: true });
});

/* ---------- Expenses API ---------- */
// GET /api/expenses
app.get("/api/expenses", (req, res) => {
  const data = readData();
  res.json(data.expenses);
});

// POST /api/expenses { amount, category }
app.post("/api/expenses", (req, res) => {
  const { amount, category } = req.body;
  if(amount == null || isNaN(Number(amount))) return res.status(400).json({ error: "Amount required" });

  const data = readData();
  const e = { id: uuidv4(), amount: Number(amount), category: String(category || "Other"), date: new Date() };
  data.expenses.unshift(e);
  writeData(data);
  res.json(e);
});

/* ---------- Serve static (optional) ---------- */
/* If you want to serve the frontend from backend, uncomment and build the frontend into backend/public */
// const publicDir = path.join(__dirname, "public");
// app.use(express.static(publicDir));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(Server started on http://localhost:${PORT}));

