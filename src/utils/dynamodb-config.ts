import { DataMapper } from "@aws/dynamodb-data-mapper";
import { DynamoDB } from "aws-sdk";

export const getDynamoDbConfig = () => {
  const NODE_ENV = process.env.NODE_ENV;
  return NODE_ENV === "local" || NODE_ENV === "test"
    ? { endpoint: "http://localhost:8000", region: "eu-west-1" }
    : {};
};

export const mapper = new DataMapper({
  client: new DynamoDB(getDynamoDbConfig()),
});

export const constructTableName = (tableName: string): string => {
  return `${process.env.TABLE_NAME_PREFIX || ""}${tableName}`;
};
