import AWS from "aws-sdk";
import { ORDERS_TABLE } from "../../constants.js";
import dotenv from "dotenv";

dotenv.config();
console.log("Environment variables loaded.");

const dynamoDb = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
});
console.log("DynamoDB client initialized.");

export const handler = async (event) => {
  console.log("Handler invoked with event:", event);

  const tableName = ORDERS_TABLE;
  console.log("Table name resolved:", tableName);

  const params = {
    TableName: tableName,
  };
  console.log("DynamoDB scan parameters prepared:", params);

  try {
    const data = await dynamoDb.scan(params).promise();
    console.log("Data fetched successfully from DynamoDB:", data);

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error("Error fetching data from DynamoDB:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error fetching orders",
        error: error.message,
      }),
    };
  }
};