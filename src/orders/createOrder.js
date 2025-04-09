const AWS = require("aws-sdk");
const { ORDERS_TABLE } = require("../../constants");

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event, context, callback) => {
  const tableName = ORDERS_TABLE;
  const requestBody = JSON.parse(event.body);

  if (!requestBody || !requestBody.customerName || !requestBody.items) {
    callback(null, {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Pedido inválido. Nome do cliente e itens são obrigatórios.",
      }),
    });
    return;
  }

  const params = {
    TableName: tableName,
    Item: {
      orderId: AWS.util.uuid.v4(),
      customerName: requestBody.customerName,
      items: requestBody.items,
      orderDate: new Date().toISOString(),
    },
  };

  try {
    await dynamoDb.put(params).promise();

    callback(null, {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Pedido criado com sucesso!",
        orderId: params.Item.orderId,
      }),
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);

    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Erro ao criar o pedido.",
        error: error.message,
      }),
    });
  }
};
