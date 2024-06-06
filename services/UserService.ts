import { v4 as uuidv4 } from "uuid";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import dynamoDB from "../database/connection";

class UserService {
    private dbClient: DocumentClient;

    constructor() {
        this.dbClient = dynamoDB;
    }

    async signUp(username: string, password: string) {
        const userId = uuidv4().toString();
        const checkExistingParams: DocumentClient.QueryInput = {
            TableName: "egemoroglu-users",
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username,
            },
        };
        const data = await this.dbClient.query(checkExistingParams).promise();
        if ((data.Items?.length ?? 0) > 0) {
            throw new Error("User already exists");
        }

        const params: DocumentClient.PutItemInput = {
            TableName: "egemoroglu-users",
            Item: {
                userId: userId,
                username: username,
                password: password,
            },
        };
        await this.dbClient.put(params).promise();
        return { message: "User successfully signed up" };
    }

    async signIn(username: string, password: string) {
        const params: DocumentClient.QueryInput = {
            TableName: "egemoroglu-users",
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username,
            },
        };
        const data = await this.dbClient.query(params).promise();
        const items = data.Items ?? [];
        if (items.length === 0) {
            throw new Error("User not found");
        }

        const user = items[0];
        if (user.password !== password) {
            throw new Error("Invalid password");
        }

        return { message: "User successfully signed in" };
    }

    async deleteUser(username: string) {
        const checkExistingParams: DocumentClient.QueryInput = {
            TableName: "egemoroglu-users",
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username,
            },
        };
        const data = await this.dbClient.query(checkExistingParams).promise();
        const items = data.Items ?? [];
        if (items.length === 0) {
            throw new Error("User not found");
        }
        const params: DocumentClient.DeleteItemInput = {
            TableName: "egemoroglu-users",
            Key: {
                userId: items[0].userId,
            },
        };
        await this.dbClient.delete(params).promise();
        return { message: "User successfully deleted" };
    }
}

export default new UserService();
