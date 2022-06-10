import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from "aws-lambda";
import { SHA3 } from "sha3";
import { mapper } from "../../utils/dynamodb-config";
import { VaultDocument } from "../vault";

export type getParams = {
  id?: string;
};

export const get: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams: getParams = event.queryStringParameters!;
    if (!queryParams.id) {
      throw new Error("You should provide an id");
    }
    const vault: VaultDocument = new VaultDocument();
    vault.id = queryParams.id;
    vault.ciphertext = (await mapper.get(vault)).ciphertext;

    return {
      statusCode: 200,
      body: JSON.stringify(vault),
    };
  } catch (e: any) {
    console.log(e.message);
    return {
      statusCode: 500,
      body: "",
    };
  }
};

export type postParams = {
  token: string;
  ciphertext: string;
};

export const post: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const requestData: postParams = JSON.parse(event?.body!);
  const hash = new SHA3(256);

  try {
    const vault: VaultDocument = new VaultDocument();
    vault.id = hash.update(requestData.token).digest("hex");
    vault.ciphertext = requestData.ciphertext;
    await mapper.put(vault);

    return {
      statusCode: 200,
      body: JSON.stringify(vault),
    };
  } catch (e: any) {
    console.log(e.message);
    return {
      statusCode: 500,
      body: "",
    };
  }
};
