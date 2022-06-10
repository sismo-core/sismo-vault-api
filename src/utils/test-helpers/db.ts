import { getDynamoDbConfig } from "../dynamodb-config";
import { DynamoDB } from "aws-sdk";
import vaultSchema from "../../vault/schema.db.json";
import { CreateTableInput, DeleteTableInput } from "aws-sdk/clients/dynamodb";

export const setupDBSchema = async (): Promise<DynamoDB> => {
  const dynamoDB: DynamoDB = new DynamoDB({
    ...getDynamoDbConfig(),
  });
  const tables: CreateTableInput[] = [
    {
      TableName: "Vault",
      ...vaultSchema,
    },
  ].map((table) => ({
    ...table,
    ProvisionedThroughput: {
      ReadCapacityUnits: 10,
      WriteCapacityUnits: 10,
    },
  }));

  for (const table of tables) {
    await dynamoDB.createTable(table).promise();
  }
  return dynamoDB;
};

export const cleanDBSchema = async (dynamoDB: DynamoDB) => {
  const tables: DeleteTableInput[] = [
    {
      TableName: "Vault",
    },
  ];
  for (const table of tables) {
    await dynamoDB.deleteTable(table).promise();
  }
};
