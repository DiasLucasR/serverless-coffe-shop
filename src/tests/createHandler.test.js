const AWS = require("aws-sdk");
const { handler } = require("../orders/createOrder");

jest.mock("aws-sdk");

const mockPut = jest.fn();
AWS.DynamoDB.DocumentClient = jest.fn(() => ({
  put: mockPut,
}));

describe("Lambda Function - Create Order", () => {
  const ORDERS_TABLE = "OrdersTable";
  const callback = jest.fn();

  process.env.ORDERS_TABLE = ORDERS_TABLE;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should return 400 for invalid request body", async () => {
    const event = { body: JSON.stringify({}) }; // Missing required fields
    await handler(event, {}, callback);

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Pedido inválido. Nome do cliente e itens são obrigatórios.",
      }),
    });
  });

  test("should return 201 for a valid request", async () => {
    const mockOrderId = "123e4567-e89b-12d3-a456-426614174000";
    jest.spyOn(AWS, "uuid").mockReturnValueOnce({
      v4: () => mockOrderId,
    });

    const requestBody = {
      customerName: "Jane Doe",
      items: ["item1", "item2"],
      description: "Test order description",
    };

    const event = { body: JSON.stringify(requestBody) };

    mockPut.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({}),
    });

    await handler(event, {}, callback);

    expect(mockPut).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
      Item: {
        orderId: mockOrderId,
        details: {
          description: requestBody.description,
          customerName: requestBody.customerName,
        },
      },
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Order Created!",
        orderId: mockOrderId,
      }),
    });
  });

  test("should return 500 on DynamoDB error", async () => {

    const requestBody = {
      customerName: "Jane Doe",
      items: ["item1", "item2"],
      description: "Test order description",
    };

    const event = { body: JSON.stringify(requestBody) };

    mockPut.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValueOnce(new Error("DynamoDB Error")),
    });

    await handler(event, {}, callback);

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Error on create order.",
        error: "DynamoDB Error",
      }),
    });
  });
});