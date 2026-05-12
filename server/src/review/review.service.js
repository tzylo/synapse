import { fetchPRDiff } from "../github/github.service.js";
import { analyzeDiff } from "../analysis/ai.service.js";
import { postPRComment } from "../github/github.comment.js";
import { formatComment } from "../github/comment.formatter.js";
import { cachePROutput } from "../utils/cache.js";
import Logger from "../utils/logger/index.js";

const logger = new Logger("review-service");

export const reviewService = async ({prApiUrl, installationId, prTitle, prDescription}) => {
  logger.debug("PR API URL:", prApiUrl);
  const diff = await fetchPRDiff(prApiUrl, installationId);

  logger.debug("Diff:", diff);

  const result = await analyzeDiff(diff, prTitle, prDescription);
  logger.debug("Result:", JSON.stringify(result, null, 2))

  const comment = formatComment(result);

  
  logger.debug("Comment:", comment);

  await postPRComment(prApiUrl, comment, installationId);

  cachePROutput(prApiUrl, result);

  return result;
};