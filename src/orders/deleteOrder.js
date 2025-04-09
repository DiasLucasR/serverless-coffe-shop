const AWS = require("aws-sdk");
const { ORDERS_TABLE } = require("../../constants");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context, callback) => {
    const tableName = ORDERS_TABLE;
    const { id } = event.pathParameters;

    if (!id) {
        callback(null, {
            statusCode: 400,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "The Order Id is required.",
            }),
        });
        return;
    }

    const params = {
        TableName: tableName,
        Key: {
            orderId: id,
        },
    };

    try {
        await dynamoDb.delete(params).promise();

        callback(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: `Order with ID '${orderId}' was removed.`,
            }),
        });
    } catch (error) {
        callback(null, {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Error on remove the order.",
                error: error.message,
            }),
        });
    }
};
