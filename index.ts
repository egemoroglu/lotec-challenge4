import express, {Express,Request, Response} from 'express';
import dotenv from 'dotenv'
import bodyParser from 'body-parser';
import  dynamoDB  from './database/connection.js';
import {v4 as uuidv4} from 'uuid';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cors from 'cors';
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const dbClient: DocumentClient = dynamoDB;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.use(cors());


app.post('/signup', async (req: Request, res: Response) => {
    try{
        const { username, password } = req.body;
        console.log('username and password received', username, password);
        const userId = uuidv4().toString();
        console.log("Sign up request received");

        const checkExistingParams: DocumentClient.QueryInput = {
            TableName: "egemoroglu-users",
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            }
        };
        const data = await dbClient.query(checkExistingParams).promise();
        if(data.Items?.length > 0){
            return res.status(409).json({error: "User already exists"});
        }

        const params: DocumentClient.PutItemInput = {
            TableName: "egemoroglu-users",
            Item: {
                userId: userId,
                username: username,
                password: password
            }
        };
        await dbClient.put(params).promise();
        res.status(200).json( {message: "User successfully signed up"});

    }catch(err) {
        console.error(err);
        res.status(500).json({error: "Sign up request failed"});
    }
})

app.post('/signin', async (req, res) => {
    try{
        const {username, password} = req.body;
        console.log('username and password received', username, password);
        console.log("Sign in request received");
        const params: DocumentClient.QueryInput = {
            TableName: "egemoroglu-users",
            IndexName: "username-index",
            KeyConditionExpression: "username = :username",
            ExpressionAttributeValues: {
                ":username": username
            }
        };
        const data = await dbClient.query(params).promise();
        if(data.Items?.length === 0){
            return res.status(404).json({error: "User not found"});
        }

        const user = data.Items[0];
        if(user.password != password) {
            return res.status(401).json({error: "Invalid password"});
        
        }

        res.status(200).json({message: "User successfully signed in"});
        
    }catch(err) {

        console.error(err);
        res.status(500).json({error: "Sign in request failed"});
    }
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});