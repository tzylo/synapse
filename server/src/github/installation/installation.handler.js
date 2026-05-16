import { extractInstallationRepoInfo, formatLogMessage } from "./installation.service.js";
import { writeInstallationLog } from "./installation.logger.js";

function handleInstallationRepositoriesEvent(payload) {
  const eventInfo = extractInstallationRepoInfo(payload);

  if (!eventInfo) {
    writeInstallationLog("UNKNOWN EVENT RECEIVED");
    return;
  }

  writeInstallationLog(formatLogMessage(eventInfo));

  return eventInfo;
}

export { handleInstallationRepositoriesEvent };