const { handler } = require("./../orders/getOrders");
const AWS = require("aws-sdk");

jest.mock("aws-sdk", () => {
  const mockDocumentClient = {
    scan: jest.fn(),
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient),
    },
  };
});

describe("Fetch All Orders Lambda", () => {
  const mockScan = AWS.DynamoDB.DocumentClient.prototype.scan;
  const ORDERS_TABLE = "OrdersTable"; 

  let callback;

  beforeEach(() => {
    jest.clearAllMocks();
    callback = jest.fn();
  });

  it("should return all orders successfully", async () => {
    const orders = [
      { orderId: "1", details: { description: "Order 1", customerName: "Alice" } },
      { orderId: "2", details: { description: "Order 2", customerName: "Bob" } },
    ];

    const event = {};
    mockScan.mockReturnValueOnce({
      promise: jest.fn().mockResolvedValueOnce({ Items: orders }),
    });

    await handler(event, {}, callback);

    expect(mockScan).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(orders),
    });
  });

  it("should return 500 on DynamoDB error", async () => {
    const event = {};
    const errorMessage = "DynamoDB Error";

    mockScan.mockReturnValueOnce({
      promise: jest.fn().mockRejectedValueOnce(new Error(errorMessage)),
    });

    await handler(event, {}, callback);

    expect(mockScan).toHaveBeenCalledWith({
      TableName: ORDERS_TABLE,
    });

    expect(callback).toHaveBeenCalledWith(null, {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Error fetching orders",
        error: errorMessage,
      }),
    });
  });
});
