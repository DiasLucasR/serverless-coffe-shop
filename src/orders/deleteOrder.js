
import AWS from "aws-sdk";
import { ORDERS_TABLE } from "../../constants.js";
import dotenv from "dotenv";
dotenv.config();
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined, 
});

export const handler = async (event) => {
    const tableName = ORDERS_TABLE;
    const { id } = event.pathParameters;
    const orderId = id;

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "The Order Id is required.",
            })
        };
    }

    const params = {
        TableName: tableName,
        Key: {
            orderId: orderId,
        },
    };

    try {
        await dynamoDb.delete(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Order with ID '${orderId}' was removed.`,
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error on remove the order.",
                error: error.message,
            })
        };
    }
};
