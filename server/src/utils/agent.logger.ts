import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const agentLogDir = path.join(
  __dirname,
  "../../logs/agents"
);

if (!fs.existsSync(agentLogDir)) {
  fs.mkdirSync(agentLogDir, {
    recursive: true
  });
}

function getTimestamp(): string {
  return new Date().toISOString();
}

export function logAgentOutput(
  agentName: string,
  content: string
) {
  const filePath = path.join(
    agentLogDir,
    `${agentName}.log`
  );

  const logEntry = `
==================================================
TIMESTAMP: ${getTimestamp()}
==================================================

${content}


`;

  fs.appendFileSync(
    filePath,
    logEntry,
    "utf8"
  );
}

export function logAgentStep(
  agentName: string,
  label: string,
  data: unknown
) {
  const filePath = path.join(
    agentLogDir,
    `${agentName}.log`
  );

  const serialized =
    typeof data === "string"
      ? data
      : JSON.stringify(data, null, 2);

  const logEntry = `
--------------------------------------------------
${getTimestamp()} | ${label}
--------------------------------------------------

${serialized}


`;

  fs.appendFileSync(
    filePath,
    logEntry,
    "utf8"
  );
}