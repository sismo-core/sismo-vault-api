import { logger } from "../utils/logger";
import { setupDBSchema } from "../utils/test-helpers/db";

const generateLocalSchema = async () => {
  logger("Populating local DB ...");
  await setupDBSchema();
  logger("Local DB populated.");
};

generateLocalSchema();
