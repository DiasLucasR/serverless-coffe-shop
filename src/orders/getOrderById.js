const AWS = require("aws-sdk");
const { ORDERS_TABLE } = require("../../constants");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handle = async (event, context, callback) => {
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
            callback(null, {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({
                    message: "Order not found",
                }),
            });
            return;
        }

        callback(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(result.Item),
        });
    } catch (error) {

        callback(null, {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Error fetching order",
                error: error.message,
            }),
        });
    }
};
