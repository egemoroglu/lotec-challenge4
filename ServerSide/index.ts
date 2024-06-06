import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import UserService from "../services/UserService";
import TodoService from "../services/TodoService";

const app: Express = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));
app.use(cors());

app.get("/todos", async (req: Request, res: Response) => {
  const { username } = req.query;
  try {
    const todos = await TodoService.getTodos(username as string);
    res.status(200).json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get todos" });
  }
});

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const response = await UserService.signUp(username, password);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sign up request failed" });
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    console.log("Sign in request received");
    const response = await UserService.signIn(username, password);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sign in request failed" });
  }
});

app.post("/todos", async (req: Request, res: Response) => {
  try {
    const { title, username, done } = req.body;
    const response = await TodoService.addTodo(title, username, done);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add todo" });
  }
});

app.post("/markDone", async (req: Request, res: Response) => {
  try {
    const { todoId } = req.query;
    const response = await TodoService.markDone(todoId as string);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark task as done" });
  }
});

app.post("/markUndone", async (req: Request, res: Response) => {
  try {
    const { todoId } = req.query;
    const response = await TodoService.markUndone(todoId as string);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark task as undone" });
  }
});

app.post("/update", async (req: Request, res: Response) => {
  try {
    const { todoId, title } = req.body;
    const response = await TodoService.updateTodo(todoId, title);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update Task" });
  }
});

app.post("/delete", async (req: Request, res: Response) => {
  try {
    const { todoId } = req.query;
    const response = await TodoService.deleteTodo(todoId as string);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete Task" });
  }
});

app.post("/deleteUser", async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const response = await UserService.deleteUser(username);
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete User" });
  }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
