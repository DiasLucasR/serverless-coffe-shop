
import AWS from "aws-sdk";
import { ORDERS_TABLE } from "../../constants.js";
import { v4 as uuid } from "uuid";
import dotenv from "dotenv";
dotenv.config();
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
});

export const handler = async (event) => {
    const tableName = ORDERS_TABLE;
    const requestBody = JSON.parse(event.body);

    if (!requestBody) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Pedido inválido. Nome do cliente e itens são obrigatórios.",
            })
        };
    }

    const params = {
        TableName: tableName,
        Item: {
            orderId: uuid(),
            details: requestBody.details,
        },
    };
    try {
        await dynamoDb.put(params).promise();
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Order Created!",
                orderId: params.Item.orderId,
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error on create order.",
                error: error.message,
            })
        };
    }
};
