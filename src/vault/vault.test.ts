import { DynamoDB } from "aws-sdk";
import SHA3 from "sha3";
import {
  cleanDBSchema,
  setupDBSchema as setupDBSchema,
} from "../utils/test-helpers/db";
import { mockContext } from "../utils/test-helpers/mock";
import { get, getParams, post, postParams } from "./handlers/api-handler";

describe("Vault test", () => {
  let dynamoDB: DynamoDB;
  let id: string;
  let encryptedText: string;

  beforeAll(async () => {
    dynamoDB = await setupDBSchema();

    encryptedText = "04503405304958 this is an encrypted text";
  });

  afterAll(async () => {
    await cleanDBSchema(dynamoDB);
  });

  test("Should add an (encrypted) data in the vault", async () => {
    const token = "blablablatoken";
    const hash = new SHA3(256);
    id = hash.update(token).digest("hex");

    const apiInput: postParams = {
      token,
      ciphertext: encryptedText,
    };

    const result = await post(
      { body: JSON.stringify(apiInput) },
      mockContext(),
      () => {}
    );
    expect(result).toEqual({
      statusCode: 200,
      body: '{"id":"cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7","ciphertext":"04503405304958 this is an encrypted text"}',
    });
  });

  test("Should retrieve the (encrypted) data from the vault", async () => {
    const apiInput: getParams = {
      id,
    };

    const result = await get(
      { queryStringParameters: apiInput },
      mockContext(),
      () => {}
    );
    expect(result).toEqual({
      statusCode: 200,
      body: '{"id":"cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7","ciphertext":"04503405304958 this is an encrypted text"}',
    });
  });
});
