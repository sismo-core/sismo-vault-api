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
    if ((e.message as string).includes("No item with the key")) {
      return {
        statusCode: 404,
        body: "not found",
      };
    }
    return {
      statusCode: 500,
      body: "",
    };
  }
};

export type postParams = {
  token: string;
  ciphertext: string;
  version?: string;
};

export const getVault = async (id: string) => {
  try {
    const vaultToRetrieve: VaultDocument = new VaultDocument();
    vaultToRetrieve.id = id;
    vaultToRetrieve.version = (await mapper.get(vaultToRetrieve)).version;
    return vaultToRetrieve;
  } catch {
    return null;
  }
};

export const post: Handler = async (
  event: APIGatewayEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  const requestData: postParams = JSON.parse(event?.body!);
  const hash = new SHA3(256);
  const vaultId = hash.update(requestData.token).digest("hex");
  const updateVaultVersion = parseInt(requestData.version ?? "1");
  if (isNaN(updateVaultVersion)) {
    throw new Error("Version should be a number");
  }

  try {
    const vaultToRetrieve = await getVault(vaultId);
    if (vaultToRetrieve !== null) {
      const currentVaultVersion = parseInt(vaultToRetrieve.version ?? "1");
      if (currentVaultVersion > updateVaultVersion) {
        throw new Error(
          `You can't update a vault with an older version ${currentVaultVersion} > ${updateVaultVersion}`
        );
      }
    }

    // latest vault
    const vault: VaultDocument = new VaultDocument();
    vault.id = vaultId;
    vault.ciphertext = requestData.ciphertext;
    vault.version = updateVaultVersion.toString();
    await mapper.put(vault);

    // save also historical versioned content
    const vaultHistorical: VaultDocument = new VaultDocument();
    vaultHistorical.id = `${vault.id}_v${updateVaultVersion}`;
    vaultHistorical.ciphertext = vault.ciphertext;
    vaultHistorical.version = vault.version;
    await mapper.put(vaultHistorical);

    return {
      statusCode: 200,
      body: JSON.stringify(vault),
    };
  } catch (e: any) {
    return {
      statusCode: 500,
      body: e.message,
    };
  }
};
