import { fetchPRDiff } from "../github/github.service.js";
import { analyzeDiff } from "../analysis/ai.service.js";
import { postPRComment } from "../github/github.comment.js";
import { formatComment } from "../github/comment.formatter.js";
import { docsWriter } from "../doc/doc.writer.js";

export const reviewService = async ({prApiUrl, installationId}) => {
  const diff = await fetchPRDiff(prApiUrl, installationId);

  const result = await analyzeDiff(diff);

  console.log("Diff:", diff);
  console.log("Result:", result);

  const comment = formatComment(result);

  console.log("PR API URL:", prApiUrl);
  console.log("Comment:", comment);

  await postPRComment(prApiUrl, comment, installationId);

  await docsWriter({prApiUrl, installationId, sections: result.documentation.sections});

  return result;
};