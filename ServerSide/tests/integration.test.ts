import axios, {AxiosResponse} from 'axios';
import {test, expect} from 'vitest';
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import dynamoDB from '../../database/connection';

const baseUrl: string = 'https://xr2tx2mgwj.us-east-1.awsapprunner.com';

const dbClient: DocumentClient = dynamoDB;


test('Signup API', async () => {
    const response: AxiosResponse = await axios.post(`${baseUrl}/signup`, {
        username: 'testuser',
        password: 'testpassword',
        });
    
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('User successfully signed up');
})

test('Signin API', async () => {
    const response: AxiosResponse = await axios.post(`${baseUrl}/signin`, {
        username: 'testuser',
        password: 'testpassword',
        });
    
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('User successfully signed in');
})

test('Get Todos API', async () => {
    const username: string = 'testuser';
    const response: AxiosResponse = await axios.get(`${baseUrl}/todos?username=${username}`)

    expect(response.status).toBe(200);

})


test('Add Todo API', async () => {
    const response: AxiosResponse = await axios.post(`${baseUrl}/todos`, {
        title: 'testtodo',
        username: 'testuser',
        done: false,
        });
    
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Todo successfully added');
})

test('Update Todo API', async () => {
    const title: string = 'testtodo';
    const checkExistingParams: DocumentClient.QueryInput = {
        TableName: "egemoroglu-todos",
        IndexName: "title-index",
        KeyConditionExpression: "title = :title",
        ExpressionAttributeValues: {
            ":title": title,
        },
    };
    const data = await dbClient.query(checkExistingParams).promise();
    const items = data.Items ?? [];
    const todoId = items[0].todoId;
    const response = await axios.post(`${baseUrl}/update`, {
        todoId: todoId,
        title: 'updatedtodo',
    });

    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Task successfully updated')

})

test('Mark Done API', async () => {
    const title: string = 'updatedtodo';
    const checkExistingParams: DocumentClient.QueryInput = {
        TableName: "egemoroglu-todos",
        IndexName: "title-index",
        KeyConditionExpression: "title = :title",
        ExpressionAttributeValues: {
            ":title": title
        },
    };
    const data = await dbClient.query(checkExistingParams).promise();
    const items = data.Items ?? [];
    const todoId = items[0].todoId;
    const response: AxiosResponse = await axios.post(`${baseUrl}/markdone?todoId=${todoId}`);
    
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Task successfully marked as done');
})

test('Mark Undone API', async () => {
    const title: string = 'updatedtodo';
    const checkExistingParams: DocumentClient.QueryInput = {
        TableName: "egemoroglu-todos",
        IndexName: "title-index",
        KeyConditionExpression: "title = :title",
        ExpressionAttributeValues: {
            ":title": title
        },
    };
    const data = await dbClient.query(checkExistingParams).promise();
    const items = data.Items ?? [];
    const todoId = items[0].todoId;
    const response: AxiosResponse = await axios.post(`${baseUrl}/markUndone?todoId=${todoId}`);
    
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Task successfully marked as undone');
})

test('Delete Todo API', async () => {

    const title: string = 'updatedtodo';
    const checkExistingParams: DocumentClient.QueryInput = {
        TableName: "egemoroglu-todos",
        IndexName: "title-index",
        KeyConditionExpression: "title = :title",
        ExpressionAttributeValues: {
            ":title": title
        },
    };
    const data = await dbClient.query(checkExistingParams).promise();
    const items = data.Items ?? [];
    const todoId = items[0].todoId;
    const response: AxiosResponse = await axios.post(`${baseUrl}/delete?todoId=${todoId}`);
    
    expect(response.status).toBe(200);
    expect(response.data.message).toBe('Task successfully deleted');
})

test('Delete User API', async () => {
    const response: AxiosResponse = await axios.post(`${baseUrl}/deleteuser`, {
        username: 'testuser',
        });
    
        expect(response.status).toBe(200);
        expect(response.data.message).toBe('User successfully deleted');

})

