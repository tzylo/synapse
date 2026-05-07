import { fetchPRDiff } from "../github/github.service.js";
import { analyzeDiff } from "../analysis/ai.service.js";
import { postPRComment } from "../github/github.comment.js";
import { formatComment } from "../github/comment.formatter.js";
import { cachePROutput } from "../utils/cache.js";

export const reviewService = async ({prApiUrl, installationId}) => {
  const diff = await fetchPRDiff(prApiUrl, installationId);

  const result = await analyzeDiff(diff);

  console.log("Diff:", diff);
  console.log("Result:", result);

  const comment = formatComment(result);

  console.log("PR API URL:", prApiUrl);
  console.log("Comment:", comment);

  await postPRComment(prApiUrl, comment, installationId);

  cachePROutput(prApiUrl, result);

  return result;
};