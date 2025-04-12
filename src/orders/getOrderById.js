
import AWS from "aws-sdk";
import { ORDERS_TABLE } from "../../constants.js";
const dynamoDb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    const tableName = ORDERS_TABLE;
    const { id } = event.pathParameters;

    const params = {
        TableName: tableName,
        Key: {
            orderId: id,
        },
    };

    try {
        const result = await dynamoDb.get(params).promise();

        if (!result.Item) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Order not found",
                })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error fetching order",
                error: error.message,
            }),
        };
    }
};
