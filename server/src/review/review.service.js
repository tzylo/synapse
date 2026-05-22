import { fetchPRDiff, fetchTzyloConfig }
  from "../github/github.service.js";

import { generateRawReview }
  from "../agents/review/rawReviewer.agent.js";

import { classifyReview }
  from "../agents/review/reviewClassifier.agent.js";

import { postPRComment }
  from "../github/github.comment.js";

import { formatComment }
  from "./comment.formatter.js";

import { cachePROutput }
  from "../utils/cache.js";

import Logger
  from "../utils/logger/index.js";

const logger = new Logger("ReviewService");

export const reviewService = async ({
  prApiUrl,
  installationId,
  prTitle,
  prDescription
}) => {

  logger.debug("PR API URL:", {
    prApiUrl
  });

  const diff = await fetchPRDiff(
    prApiUrl,
    installationId
  );

  logger.debug("Fetched PR diff");

  let tzyloConfig = null;

  try {
    tzyloConfig =
      await fetchTzyloConfig(
        prApiUrl,
        installationId
      );

    logger.debug(
      "Loaded tzylo.config.json",
      { tzyloConfig }
    );

  } catch (error) {

    logger.warn(
      "Could not fetch tzylo.config.json"
    );
  }

  // =========================
  // AGENT 1
  // Raw signal extraction
  // =========================

  const rawReview =
    await generateRawReview({
      diff,
      prTitle,
      prDescription,
      tzyloConfig
    });

  logger.debug("Raw review generated");

  // =========================
  // AGENT 2
  // Structured classification
  // =========================

  const structuredReview =
    await classifyReview(diff,
      prTitle,
      prDescription,rawReview);

  logger.debug(
    "Structured review generated",
    { structuredReview }
  );

  // =========================
  // Deterministic rendering
  // =========================

  const comment =
    formatComment(structuredReview);

  logger.debug("Formatted comment");

  await postPRComment(
    prApiUrl,
    comment,
    installationId
  );

  cachePROutput(
    prApiUrl,
    structuredReview
  );

  return structuredReview;
};