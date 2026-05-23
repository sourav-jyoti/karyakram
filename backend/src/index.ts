import "dotenv/config";
import app from "./app";
import { connectDB, disconnectDB } from "./config/db";

const PORT = process.env.PORT ?? 3000;

async function main() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main();
