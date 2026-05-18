const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Database
const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Create Table
db.run(`
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0
)
`);

// GET all tasks
app.get("/tasks", (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      res.status(500).json(err);
    } else {
      res.json(rows);
    }
  });
});

// CREATE task
app.post("/tasks", (req, res) => {
  const { title } = req.body;

  db.run(
    "INSERT INTO tasks (title) VALUES (?)",
    [title],
    function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({
          id: this.lastID,
          title,
          completed: 0,
        });
      }
    }
  );
});

// UPDATE task
app.put("/tasks/:id", (req, res) => {
  const { title, completed } = req.body;

  db.run(
    "UPDATE tasks SET title = ?, completed = ? WHERE id = ?",
    [title, completed, req.params.id],
    function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ message: "Task updated" });
      }
    }
  );
});

// DELETE task
app.delete("/tasks/:id", (req, res) => {
  db.run(
    "DELETE FROM tasks WHERE id = ?",
    [req.params.id],
    function (err) {
      if (err) {
        res.status(500).json(err);
      } else {
        res.json({ message: "Task deleted" });
      }
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});