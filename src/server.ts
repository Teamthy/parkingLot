
import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();

app.listen(env.port, () => {
  console.log(`Parking lot API running on port ${env.port}`);
});
