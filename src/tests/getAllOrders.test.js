import AWS from 'aws-sdk';
import { faker } from '@faker-js/faker';
import  { handler } from '../orders/getOrders';

jest.mock('aws-sdk', () => {
  const mDynamoDB = {
    scan: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };

  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        scan: mDynamoDB.scan,
        promise: mDynamoDB.promise
      }))
    }
  };
});


describe('GET /orders', () => {
  let dynamoDBMock;

  beforeEach(() => {
    jest.clearAllMocks();
    dynamoDBMock = new AWS.DynamoDB.DocumentClient();
  });

  test('should return code 200', async () => {

    const mockOrders = {
      Items: [
        {
          orderId: faker.string.uuid(),
          details: {
            clientName: faker.person.fullName(),
            items: Array.from({ length: 3 }, () => faker.commerce.productName()),
            description: faker.lorem.sentence()
          }
        }, {
          orderId: faker.string.uuid(),
          details: {
            clientName: faker.person.fullName(),
            items: Array.from({ length: 2 }, () => faker.commerce.productName()),
            description: faker.lorem.sentence()
          }
        }],
    }

    dynamoDBMock.promise.mockResolvedValueOnce(mockOrders);



    const event = {
      httpMethod: 'GET',
      pathParameters: null,
      queryStringParameters: null
    };

    const result = await handler(event);
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockOrders.Items);

  })

  test('should return code 500', async () => {

    const dbError = new Error('Internal Error DynamoDB');
    dynamoDBMock.promise.mockRejectedValueOnce(dbError);

    const event = {
      httpMethod: 'GET',
      pathParameters: null,
      queryStringParameters: null
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body)).toEqual({
      message: 'Error fetching orders',
      error: dbError.message
    });
  });
});
