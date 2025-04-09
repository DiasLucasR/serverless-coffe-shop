const { handle } = require("./../orders/getOrderById");
const AWS = require("aws-sdk");

jest.mock("aws-sdk", () => {
  const mockDocumentClient = {
    get: jest.fn(),
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient),
    },
  };
});

describe("Get Order Lambda", () => {
  const mockGet = AWS.DynamoDB.DocumentClient.prototype.get;
  const ORDERS_TABLE = "OrdersTable";

  let callback;

  beforeEach(() => {
    jest.clearAllMocks();
    callback = jest.fn();
  });

  it("should return 404 if the order is not found", async () => {
    const id = "nonexistent-id";
    const event = { pathParameters: { id } };

    mockGet.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({}),
    });

    await handle(event, {}, callback);

    expect(mockGet).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
      Key: { orderId: id },
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 404,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Order not found" }),
    });
  });

  it("should return the order successfully", async () => {
    const id = "12345";
    const order = {
      orderId: id,
      details: {
        description: "Test Order",
        customerName: "John Doe",
      },
    };
    const event = { pathParameters: { id } };

    mockGet.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({ Item: order }),
    });

    await handle(event, {}, callback);

    expect(mockGet).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
      Key: { orderId: id },
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(order),
    });
  });

  it("should return 500 on DynamoDB error", async () => {
    const id = "12345";
    const event = { pathParameters: { id } };

    mockGet.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValueOnce(new Error("DynamoDB Error")),
    });

    await handle(event, {}, callback);

    expect(mockGet).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
      Key: { orderId: id },
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Error fetching order",
        error: "DynamoDB Error",
      }),
    });
  });
});
