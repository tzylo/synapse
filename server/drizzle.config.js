import ENV from './src/config/env.js';

if (!ENV.DB.URL) {
  throw new Error("DATABASE_URL is required in environment variables.");
}

export default {
  schema: "./src/db/schema/*",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: ENV.DB.URL
  }
};