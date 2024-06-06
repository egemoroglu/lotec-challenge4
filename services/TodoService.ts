import { v4 as uuidv4 } from "uuid";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import dynamoDB from "../database/connection";

class TodoService {
    private dbClient: DocumentClient;

    constructor() {
        this.dbClient = dynamoDB;
    }

    async getTodos(username: string) {
        const params: DocumentClient.QueryInput = {
            TableName: "egemoroglu-todos",
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username,
            },
        };
        const data = await this.dbClient.query(params).promise();
        return data.Items;
    }

    async addTodo(title: string, username: string, done: boolean) {
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
        await this.dbClient.put(params).promise();
        return { message: "Todo successfully added" };
    }

    async markDone(todoId: string) {
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
        await this.dbClient.update(params).promise();
        return { message: "Task successfully marked as done" };
    }

    async markUndone(todoId: string) {
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
        await this.dbClient.update(params).promise();
        return { message: "Task successfully marked as undone" };
    }

    async updateTodo(todoId: string, title: string) {
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
        await this.dbClient.update(params).promise();
        return { message: "Task successfully updated" };
    }

    async deleteTodo(todoId: string) {
        const params: DocumentClient.DeleteItemInput = {
            TableName: "egemoroglu-todos",
            Key: {
                todoId: todoId,
            },
        };
        await this.dbClient.delete(params).promise();
        return { message: "Task successfully deleted" };
    }
}

export default new TodoService();
