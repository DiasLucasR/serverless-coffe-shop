import { handler } from "./createOrder.js";
import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";

jest.mock("aws-sdk", () => {
    const mockPut = jest.fn();
    const DocumentClient = jest.fn(() => ({
        put: mockPut,
    }));

    return { DynamoDB: { DocumentClient } };
});

jest.mock("uuid", () => ({
    v4: jest.fn(() => "mocked-uuid"),
}));

describe("createOrder.handler", () => {
    const mockPut = AWS.DynamoDB.DocumentClient.prototype.put;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve retornar 400 quando o body não for fornecido", async () => {
        const event = { body: null };

        const result = await handler(event);

        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body).message).toBe(
            "Pedido inválido. Nome do cliente e itens são obrigatórios."
        );
    });

    it("deve criar um pedido com sucesso", async () => {
        const customerName = faker.name.fullName();
        const items = Array.from({ length: 3 }, () => faker.commerce.productName());

        const event = {
            body: JSON.stringify({
                details: { customerName, items },
            }),
        };

        mockPut.mockImplementation(() => ({
            promise: jest.fn().mockResolvedValueOnce({}),
        }));

        const result = await handler(event);

        expect(result.statusCode).toBe(201);
        const responseBody = JSON.parse(result.body);
        expect(responseBody.message).toBe("Order Created!");
        expect(responseBody.orderId).toBe("mocked-uuid");

        expect(mockPut).toHaveBeenCalledWith({
            TableName: process.env.ORDERS_TABLE || "OrdersTable",
            Item: {
                orderId: "mocked-uuid",
                details: { customerName, items },
            },
        });
    });

    it("deve retornar 500 quando ocorrer um erro na inserção", async () => {
        const customerName = faker.name.fullName();
        const items = Array.from({ length: 3 }, () => faker.commerce.productName());

        const event = {
            body: JSON.stringify({
                details: { customerName, items },
            }),
        };

        mockPut.mockImplementation(() => ({
            promise: jest.fn().mockRejectedValueOnce(new Error("DynamoDB error")),
        }));

        const result = await handler(event);

        expect(result.statusCode).toBe(500);
        const responseBody = JSON.parse(result.body);
        expect(responseBody.message).toBe("Error on create order.");
        expect(responseBody.error).toBe("DynamoDB error");

        expect(mockPut).toHaveBeenCalledWith({
            TableName: process.env.ORDERS_TABLE || "OrdersTable",
            Item: {
                orderId: "mocked-uuid",
                details: { customerName, items },
            },
        });
    });
});
