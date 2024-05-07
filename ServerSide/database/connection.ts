import AWS from "aws-sdk"
import dotenv from "dotenv";
import path from "path";
dotenv.config({path: path.join(__dirname, '../.env')});

const region = process.env.REGION

console.log('REGION:', region)


const dynamodb = new AWS.DynamoDB.DocumentClient({
    region,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY

});

export default dynamodb;