import express from 'express';
import bodyParser from 'body-parser';
import  dynamoDB  from './database/connection.js';
import {v4 as uuidv4} from 'uuid';
//import {DocumentClient} from 'aws-sdk/clients/dynamodb';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const app = express();
const PORT = 5173;

const dbClient = dynamoDB;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/signup', async (req, res) => {
    try{
        const { username, password } = req.body;
        const id = uuidv4();
        console.log("Sign up request received");

        const params = {
            TableName: "egemoroglu-users",
            Item: {
                id: {S: id},
                username: {S: username},
                password: {S: password}
            }
        };
        await dbClient.put(params).promise();
        res.status(200).json( {message: "User successfully signed up"});

    }catch(err) {
        console.error(err);
        res.status(500).json({error: "Sign up request failed"});
    }
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});