import { DynamoDB } from "aws-sdk";
import SHA3 from "sha3";
import {
  cleanDBSchema,
  setupDBSchema as setupDBSchema,
} from "../utils/test-helpers/db";
import { mockContext } from "../utils/test-helpers/mock";
import { get, getParams, post, postParams } from "./handlers/api-handler";
import { VaultDocument } from "./vault";

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
      body: '{"id":"cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7","ciphertext":"04503405304958 this is an encrypted text","version":"1"}',
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

  test("Should test an other id and return a 404", async () => {
    const apiInput: getParams = {
      id: id + 1,
    };

    const result = await get(
      { queryStringParameters: apiInput },
      mockContext(),
      () => {}
    );
    expect(result).toEqual({
      statusCode: 404,
      body: "not found",
    });
  });

  describe("test version feature", () => {
    test("Should add an encrypted data with a version 3", async () => {
      const token = "blablablatoken";
      const hash = new SHA3(256);
      id = hash.update(token).digest("hex");

      const apiInput: postParams = {
        token,
        ciphertext: encryptedText + " with v3",
        version: "3",
      };

      const result = await post(
        { body: JSON.stringify(apiInput) },
        mockContext(),
        () => {}
      );
      expect(result).toEqual({
        statusCode: 200,
        body: '{"id":"cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7","ciphertext":"04503405304958 this is an encrypted text with v3","version":"3"}',
      });
    });

    test("Should try to update without a version, should throw", async () => {
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
        statusCode: 500,
        body: "You can't update a vault with an older version 3 > 1",
      });
    });

    test("Should try to update without a lower version, should throw", async () => {
      const token = "blablablatoken";
      const hash = new SHA3(256);
      id = hash.update(token).digest("hex");

      const apiInput: postParams = {
        token,
        ciphertext: encryptedText,
        version: "2",
      };

      const result = await post(
        { body: JSON.stringify(apiInput) },
        mockContext(),
        () => {}
      );
      expect(result).toEqual({
        statusCode: 500,
        body: "You can't update a vault with an older version 3 > 2",
      });
    });

    test("Should be able to upgrade with version 4", async () => {
      const token = "blablablatoken";
      const hash = new SHA3(256);
      id = hash.update(token).digest("hex");

      const apiInput: postParams = {
        token,
        ciphertext: encryptedText + " with v4",
        version: "4",
      };

      const result = await post(
        { body: JSON.stringify(apiInput) },
        mockContext(),
        () => {}
      );
      expect(result).toEqual({
        statusCode: 200,
        body: '{"id":"cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7","ciphertext":"04503405304958 this is an encrypted text with v4","version":"4"}',
      });
    });

    test("Should be able to post with exact same version", async () => {
      const token = "blablablatoken";
      const hash = new SHA3(256);
      id = hash.update(token).digest("hex");

      const apiInput: postParams = {
        token,
        ciphertext: encryptedText + "blabla",
        version: "4",
      };

      const result = await post(
        { body: JSON.stringify(apiInput) },
        mockContext(),
        () => {}
      );
      expect(result).toEqual({
        statusCode: 200,
        body: '{"id":"cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7","ciphertext":"04503405304958 this is an encrypted textblabla","version":"4"}',
      });
    });

    test("Should list all vault", async () => {
      const vaults = await dynamoDB.scan({ TableName: "Vault" }).promise();
      expect(vaults.Items).toHaveLength(4);
      expect(vaults.Items).toEqual([
        {
          version: { S: "1" },
          ciphertext: { S: "04503405304958 this is an encrypted text" },
          id: {
            S: "cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7_v1",
          },
        },
        {
          version: { S: "3" },
          ciphertext: { S: "04503405304958 this is an encrypted text with v3" },
          id: {
            S: "cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7_v3",
          },
        },
        {
          version: { S: "4" },
          ciphertext: { S: "04503405304958 this is an encrypted textblabla" },
          id: {
            S: "cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7_v4",
          },
        },
        {
          version: { S: "4" },
          ciphertext: { S: "04503405304958 this is an encrypted textblabla" },
          id: {
            S: "cd374ee55889ecf95c932724fb945fa1326245bd200aadd956ca4febd3c4b5f7",
          },
        },
      ]);
    });
  });
});
