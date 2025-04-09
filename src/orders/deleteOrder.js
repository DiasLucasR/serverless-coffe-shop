const AWS = require("aws-sdk");
const { ORDERS_TABLE } = require("../../constants");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context, callback) => {
  const tableName = ORDERS_TABLE;
  const orderId = event.pathParameters.id; 

  if (!orderId) {
    callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "O ID do pedido é obrigatório.",
      }),
    });
    return;
  }

  const params = {
    TableName: tableName,
    Key: {
      orderId: orderId,
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
        message: `Pedido com ID '${orderId}' foi excluído com sucesso.`,
      }),
    });
  } catch (error) {
    console.error("Erro ao excluir pedido:", error);

    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Erro ao excluir o pedido.",
        error: error.message,
      }),
    });
  }
};
