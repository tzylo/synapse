const pino = require("pino");
const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../../../logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

function getLogFileName() {
  const now = new Date();
  return `app-${now.getUTCFullYear()}-${now.getUTCMonth()+1}-${now.getUTCDate()}-${now.getUTCHours()}.log`;
}

const destination = pino.destination({
  dest: path.join(logDir, getLogFileName()),
  sync: false
});

module.exports = {
    destination
}