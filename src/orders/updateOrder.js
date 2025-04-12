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
    const requestBody = JSON.parse(event.body);
    const orderId = id;

    if (!id || !requestBody || Object.keys(requestBody).length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Order ID and update data are required.",
            }),
        };
    }

    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    for (const key in requestBody) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = requestBody[key];
    }

    const params = {
        TableName: tableName,
        Key: {
            orderId: orderId,
        },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "UPDATED_NEW",
    };

    try {
        const result = await dynamoDb.update(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Order with ID '${orderId}' was updated successfully.`,
                updatedAttributes: result.Attributes,
            }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating order.",
                error: error.message,
            }),
        };
    }
};
