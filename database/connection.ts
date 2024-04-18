import DynamoDB from "aws-sdk/clients/dynamodb";

const dynamodb = new DynamoDB.DocumentClient();

export default dynamodb;