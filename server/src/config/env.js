import dotenv from "dotenv";

dotenv.config();

function requiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(
      `[ENV] Missing required environment variable: ${key}`
    );
  }

  return value;
}

function optionalEnv(
  key,
  defaultValue
) {
  const value = process.env[key];

  return value !== undefined ? value : defaultValue;
}

function featureEnv(key) {
  const value = process.env[key];

  if (!value) {
    console.error(`[ENV] Feature variable missing: ${key}`);
    return null;
  }

  return value;
}

function featureEnabled(key) {
  return optionalEnv(key, "false") === "true";
}

const ENV = {
  CLAUDE: {
    API_KEY: requiredEnv("CLAUDE_API_KEY"),
  },

  DB : {
    URL: requiredEnv("DATABASE_URL"),
  },

  GITHUB: {
    APP_ID: requiredEnv("GITHUB_APP_ID"),
    PRIVATE_KEY_PATH: requiredEnv(
      "GITHUB_PRIVATE_KEY_PATH"
    ),
    WEBHOOK_SECRET: requiredEnv(
      "GITHUB_WEBHOOK_SECRET"
    ),
  },

  LOG_LEVEL: optionalEnv("LOG_LEVEL", "info"),

  NODE_ENV: optionalEnv(
    "NODE_ENV",
    "development"
  ),

  OPENROUTER: {
    API_KEY: requiredEnv("OPENROUTER_API_KEY"),
  },

  OPENAI: {
    API_KEY: requiredEnv("OPENAI_API_KEY"),
  },

  PORT: optionalEnv("PORT", 7200),
};

export default ENV;