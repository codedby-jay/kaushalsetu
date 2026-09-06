import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`KaushalSetu API listening on port ${env.port}`);
  console.log(`Health check: http://localhost:${env.port}/api/health`);
});
