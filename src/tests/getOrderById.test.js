import AWS from 'aws-sdk';
import { faker } from '@faker-js/faker';
import  { handler } from '../orders/getOrderById';

jest.mock("aws-sdk", () => {
  const mockDocumentClient = {
    get: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient),
    },
  };
});

const generateMockOrder = () => {
  return {
    orderId: faker.string.uuid(),
    details: {
      clientName: faker.person.fullName(),
      items: Array.from({ length: 3 }, () => faker.commerce.productName()),
      description: faker.lorem.sentence()
    }
  };
};

describe("GET /orders/{id}", () => {
  let dynamoDBMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dynamoDBMock = new AWS.DynamoDB.DocumentClient();
  });


  test("should return code 200 ", async () => {
    const mockOrder = generateMockOrder();
    const id = mockOrder.orderId;

    dynamoDBMock.promise.mockResolvedValueOnce({
      Item: mockOrder
    });

    const event = { pathParameters: { id } };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockOrder);

    expect(dynamoDBMock.get).toHaveBeenCalledWith({
      Key: { orderId: id }
    });
  });

  test("should return code 404", async () => {
    const id = faker.string.uuid();

    dynamoDBMock.promise.mockResolvedValueOnce({
      Item: null
    });

    const event = { pathParameters: { id } };

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body)).toEqual({
      message: `Order not found.`
    });
  });

  test('should return code 500 when DynamoDB fails', async () => {
    const id = faker.string.uuid();

    const dbError = new Error('Internal Error.');
    dynamoDBMock.promise.mockRejectedValueOnce(dbError);

    const event = { pathParameters: { id } };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Error fetching order.',
      error: dbError.message
    });
  });
});