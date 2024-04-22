import express, {Express,Request, Response} from 'express';
import dotenv from 'dotenv'
import bodyParser from 'body-parser';
import  dynamoDB  from './database/connection.js';
import {v4 as uuidv4} from 'uuid';
import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

const dbClient: DocumentClient = dynamoDB;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));


app.post('/signup', async (req: Request, res: Response) => {
    try{
        const { username, password } = req.body;
        const id = uuidv4();
        console.log("Sign up request received");

        const params: DocumentClient.PutItemInput = {
            TableName: "egemoroglu-users",
            Item: {
                id: id,
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

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});