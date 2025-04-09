const AWS = require("aws-sdk");
const { ORDERS_TABLE } = require("../../constants");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context, callback) => {
    const tableName = ORDERS_TABLE;

    const params = {
        TableName: tableName
    };

    try {
        const data = await dynamoDb.scan(params).promise();

        callback(null, {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify(data.Items),
        });
    } catch (error) {
        callback(null, {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({
                message: "Error fetching orders",
                error: error.message,
            }),
        });
    }
};