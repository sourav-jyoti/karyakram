import "dotenv/config";
import app from "./app.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { startNotificationWorker } from "./modules/notifications/worker.js";

const PORT = process.env.PORT ?? 3000;

async function main() {
  await connectDB();

  // Start background notification email worker
  startNotificationWorker();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main();
