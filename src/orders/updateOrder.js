const AWS = require("aws-sdk");
const { ORDERS_TABLE } = require("../../constants");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context, callback) => {
    const tableName = ORDERS_TABLE;
    const { id } = event.pathParameters;
    const requestBody = JSON.parse(event.body);


    if (!id || !requestBody || Object.keys(requestBody).length === 0) {
        callback(null, {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Order ID and update data are required.",
            }),
        });
        return;
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

        callback(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: `Order with ID '${orderId}' was updated successfully.`,
                updatedAttributes: result.Attributes,
            }),
        });
    } catch (error) {

        callback(null, {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Error updating order.",
                error: error.message,
            }),
        });
    }
};
