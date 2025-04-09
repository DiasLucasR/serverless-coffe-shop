const AWS = require("aws-sdk");
const { ORDERS_TABLE } = require("../../constants");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handle = async (event, context, callback) => {
  const tableName = ORDERS_TABLE; // Replace with your table name
  const { id } = event.pathParameters; // Retrieve `id` from the path parameters

  const params = {
    TableName: tableName,
    Key: {
      orderId: id, // Assuming `orderId` is the partition key in your table
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
    console.error("Error fetching order:", error);

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
