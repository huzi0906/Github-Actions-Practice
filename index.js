const express = require("express");
const jwt = require("jsonwebtoken");

const secret = "ullsyr089yfhdtserssu";

const app = express();
app.use(express.json());

let users = [];
let tasks = [];

app.post("/register", (req, res) => {
  const user = {
    id: user[users.length - 1].id + 1 || 1,
    username: req.body.username,
    password: req.body.password,
  };
  users.push(user);
  res.status(201).json(users);
});

// User login route
app.post("/login", (req, res) => {
  const user = users.find(
    user =>
      user.username === req.body.username && user.password === req.body.password
  );
  if (user) {
    const token = jwt.sign({ id: user.id }, secret);
    res.status(200).json({ token });
  } else {
    res.status(401).json({ message: "Invalid username or password" });
  }
});

// Middleware for checking JWT
function authenticateJWT(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).send("Unauthorized");
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).send("Unauthorized");
  }
}

// Task creation
app.post("/tasks", authenticateJWT, (req, res) => {
  const task = {
    id: tasks[tasks.length - 1].id + 1 || 1,
    name: req.body.name,
    description: req.body.description,
    status: "Pending",
    dueDate: req.body.dueDate,
    priorityLevel: req.body.priorityLevel,
    category: req.body.category,

    userId: req.user.id,
  };

  tasks.push(task);
  res.status(201).json(task);
});

// Task Categorization
app.put("/tasks/:id/category", authenticateJWT, (req, res) => {
  const task = tasks.find(task => task.id === parseInt(req.params.id));
  if (task) {
    task.category = req.body.category;
    res.status(200).json(task);
  } else {
    res.status(404).send("Task not found");
  }
});

// Task status
app.put("/tasks/:id/status", authenticateJWT, (req, res) => {
  const task = tasks.find(task => task.id === parseInt(req.params.id));
  if (task) {
    task.status = "Completed";
    res.status(200).json(task);
  } else {
    res.status(404).send("Task not found");
  }
});

// View tasks
app.get("/tasks", authenticateJWT, (req, res) => {
  let userTasks = tasks.filter(task => task.userId === req.user.id);

  const { sort } = req.query;

  if (sort === "dueDate") {
    userTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sort === "category") {
    userTasks.sort((a, b) => (a.category > b.category ? 1 : -1));
  } else if (sort === "status") {
    userTasks.sort((a, b) => (a.status > b.status ? 1 : -1));
  }

  res.json(userTasks);
});

// Task priority
app.put("/tasks/:id/priority", authenticateJWT, (req, res) => {
  const task = tasks.find(task => task.id === parseInt(req.params.id));
  if (task) {
    task.priorityLevel = req.body.priorityLevel;
    res.status(200).json(task);
  } else {
    res.status(404).send("Task not found");
  }
});

app.listen(3000, () => {
  console.log(`Server is running on port 3000`);
});
