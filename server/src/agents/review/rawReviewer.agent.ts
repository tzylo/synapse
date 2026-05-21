import { callAI } from "../../config/openrouter.client.js";

import {
  logAgentOutput,
  logAgentStep
} from "../../utils/agent.logger.js";

type RawReviewInput = {
  diff: string;
  prTitle?: string;
  prDescription?: string;
  tzyloConfig?: Record<string, any>;
};

export const generateRawReview = async (
  input: RawReviewInput
): Promise<string> => {
  const {
    diff,
    prTitle,
    prDescription,
    tzyloConfig
  } = input;

  const safeDiff =
    diff.length > 12000
      ? diff.substring(0, 12000)
      : diff;

  const configSection = tzyloConfig
    ? `
PROJECT CONTEXT:
The repository contains the following engineering conventions and architectural rules.

${JSON.stringify(tzyloConfig, null, 2)}
`
    : "";

  logAgentStep(
    "rawReviewAgent",
    "INPUT",
    {
      prTitle,
      prDescription,
      tzyloConfig
    }
  );

  logAgentStep(
    "rawReviewAgent",
    "DIFF_INFO",
    {
      originalLength: diff.length,
      truncatedLength: safeDiff.length,
      wasTruncated: diff.length > 12000
    }
  );

  const prompt = `
You are a senior software engineer performing a pull request review.

Your role is NOT to produce final review comments.

Your role is to OBSERVE and EXTRACT engineering signals from the diff.

Focus on:
- Bugs
- Maintainability concerns
- Readability concerns
- Architecture observations
- Performance concerns
- Security concerns
- Dependency/configuration impacts

IMPORTANT RULES:
- Only mention issues visible in the diff
- Do NOT invent missing business logic
- Do NOT give generic best-practice advice
- Ignore trivial formatting/style comments
- Prefer concrete observations
- Repository conventions and architecture rules are important
- Surface meaningful engineering observations even if confidence is moderate
- Avoid speculative or imaginary issues
- Do NOT classify severity
- Do NOT filter aggressively
- Return plain markdown sections

${configSection}

PR TITLE:
${prTitle || "N/A"}

PR DESCRIPTION:
${prDescription || "N/A"}

OUTPUT FORMAT:

# Bugs
- observation

# Maintainability
- observation

# Readability
- observation

# Architecture
- observation

# Performance
- observation

# Security
- observation

# Dependencies
- observation

If a section has no findings, write:
- None

DIFF:
${safeDiff}
`;

  logAgentStep(
    "rawReviewAgent",
    "PROMPT",
    prompt
  );

  const payload = {
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 1200
  };

  const data = await callAI(payload);

  const result =
    data.choices?.[0]?.message?.content || "";

  if (!result) {
    logAgentStep(
      "rawReviewAgent",
      "EMPTY_RESPONSE",
      data
    );

    return "";
  }

  logAgentOutput(
    "rawReviewAgent",
    result
  );

  return result.trim();
};