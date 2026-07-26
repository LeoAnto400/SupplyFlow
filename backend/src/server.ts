import "dotenv/config";
import { buildApp } from "./app.js";
import { loadEnv } from "./shared/config/env.js";

const env = loadEnv();
const app = buildApp(env);

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => app.log.info(`SupplyFlow backend listening on port ${env.PORT}`))
  .catch((error: unknown) => {
    app.log.error(error);
    process.exit(1);
  });
