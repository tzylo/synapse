import { fetchPRDiff } from "../github/github.service.js";
import { analyzeDiff } from "../analysis/ai.service.js";
import { postPRComment } from "../github/github.comment.js";
import { formatComment } from "../github/comment.formatter.js";

export const reviewService = async (prUrl) => {
  const diff = await fetchPRDiff(prUrl);

  const result = await analyzeDiff(diff);

  const comment = formatComment(result);

  await postPRComment(prUrl, comment);

  return result;
};