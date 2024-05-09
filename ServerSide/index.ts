import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import dynamoDB from "./database/connection.ts";
import { v4 as uuidv4 } from "uuid";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import cors from "cors";

const app: Express = express();
const dbClient: DocumentClient = dynamoDB;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.use(cors());

app.get("/todos", async (req: Request, res: Response) => {
  const { username } = req.query;
  try {
    const params: DocumentClient.QueryInput = {
      TableName: "egemoroglu-todos",
      IndexName: "username-index",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
    };
    const data = await dbClient.query(params).promise();
    res.status(200).json(data.Items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get todos" });
  }
});

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const userId = uuidv4().toString();
    const checkExistingParams: DocumentClient.QueryInput = {
      TableName: "egemoroglu-users",
      IndexName: "username-index",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
    };
    const data = await dbClient.query(checkExistingParams).promise();
    if ((data.Items?.length ?? 0) > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    const params: DocumentClient.PutItemInput = {
      TableName: "egemoroglu-users",
      Item: {
        userId: userId,
        username: username,
        password: password,
      },
    };
    await dbClient.put(params).promise();
    res.status(200).json({ message: "User successfully signed up" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sign up request failed" });
  }
});

app.post("/signin", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("Sign in request received");
    const params: DocumentClient.QueryInput = {
      TableName: "egemoroglu-users",
      IndexName: "username-index",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
    };
    const data = await dbClient.query(params).promise();
    const items = data.Items ?? [];
    if (items.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = items[0];
    if (user.password != password) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.status(200).json({ message: "User successfully signed in" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Sign in request failed" });
  }
});

app.post("/todos", async (req: Request, res: Response) => {
  try {
    const { title, username, done } = req.body;
    const todoId = uuidv4().toString();
    const params: DocumentClient.PutItemInput = {
      TableName: "egemoroglu-todos",
      Item: {
        todoId: todoId,
        title: title,
        username: username,
        done: done,
      },
    };
    await dbClient.put(params).promise();
    res.status(200).json({ message: "Todo successfully added" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add todo" });
  }
});
app.post("/markDone", async (req: Request, res: Response) => {
  try {
    const { todoId } = req.query;
    const params: DocumentClient.UpdateItemInput = {
      TableName: "egemoroglu-todos",
      Key: {
        todoId: todoId,
      },
      UpdateExpression: "set done = :done",
      ExpressionAttributeValues: {
        ":done": true,
      },
    };
    await dbClient.update(params).promise();
    res.status(200).json({ message: "Task successfully marked as done" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark task as done" });
  }
});

app.post("/markUndone", async (req: Request, res: Response) => {
  try {
    const { todoId } = req.query;
    const params: DocumentClient.UpdateItemInput = {
      TableName: "egemoroglu-todos",
      Key: {
        todoId: todoId,
      },
      UpdateExpression: "set done = :done",
      ExpressionAttributeValues: {
        ":done": false,
      },
    };
    await dbClient.update(params).promise();
    res.status(200).json({ message: "Task successfully marked as undone" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark task as undone" });
  }
});

app.post("/update", async (req: Request, res: Response) => {
  try {
    const { todoId, title } = req.body;
    const params: DocumentClient.UpdateItemInput = {
      TableName: "egemoroglu-todos",
      Key: {
        todoId: todoId,
      },
      UpdateExpression: "set title = :title",
      ExpressionAttributeValues: {
        ":title": title,
      },
    };
    await dbClient.update(params).promise();
    res.status(200).json({ message: "Task successfully updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update Task" });
  }
});

app.post("/delete", async (req: Request, res: Response) => {
  try {
    const { todoId } = req.query;
    const params: DocumentClient.DeleteItemInput = {
      TableName: "egemoroglu-todos",
      Key: {
        todoId: todoId,
      },
    };
    await dbClient.delete(params).promise();
    res.status(200).json({ message: "Task successfully deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete Task" });
  }
});

app.post("/deleteUser", async (req: Request, res: Response) => {
  try {
    const { username } = req.body;
    const checkExistingParams: DocumentClient.QueryInput = {
      TableName: "egemoroglu-users",
      IndexName: "username-index",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
    };
    const data = await dbClient.query(checkExistingParams).promise();
    const items = data.Items ?? [];
    if(items.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const params: DocumentClient.DeleteItemInput = {
      TableName: "egemoroglu-users",
      Key: {
        userId: items[0].userId,
      },
    };
    await dbClient.delete(params).promise();
    res.status(200).json({ message: "User successfully deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete User" });
  }
  

})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
