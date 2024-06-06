import AWS from "aws-sdk"

const region = process.env.REGION

console.log('REGION:', region)


const dynamodb = new AWS.DynamoDB.DocumentClient({
    region,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY

});

export default dynamodb;