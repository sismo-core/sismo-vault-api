import {
  attribute,
  hashKey,
  table,
} from "@aws/dynamodb-data-mapper-annotations";
import { constructTableName } from "../utils/dynamodb-config";

@table(constructTableName("Vault"))
export class VaultDocument {
  @hashKey()
  id: string;

  @attribute()
  ciphertext: string;
}
