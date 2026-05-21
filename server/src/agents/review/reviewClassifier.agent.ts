import { callAI } from "../../config/openrouter.client.js";

import {
  logAgentOutput,
  logAgentStep
} from "../../utils/agent.logger.js";

export type ReviewIssue = {
  type:
    | "bug"
    | "maintainability"
    | "readability"
    | "architecture"
    | "performance"
    | "security"
    | "dependency";

  severity:
    | "low"
    | "medium"
    | "high";

  confidence:
    | "low"
    | "medium"
    | "high";

  file?: string;

  message: string;

  suggestion?: string;
};

export type StructuredReview = {
  summary: string;

  issues: ReviewIssue[];

  metrics: {
    high: number;
    medium: number;
    low: number;
  };
};

const EMPTY_REVIEW: StructuredReview = {
  summary: "",
  issues: [],
  metrics: {
    high: 0,
    medium: 0,
    low: 0
  }
};

export const classifyReview = async (
  rawReview: string
): Promise<StructuredReview> => {

  logAgentStep(
    "reviewClassifierAgent",
    "RAW_REVIEW_INPUT",
    rawReview
  );

  const prompt = `
You are a senior software engineer responsible for refining pull request review findings.

You are given RAW engineering observations extracted from a pull request diff.

Your responsibilities:
- Classify findings into structured issue objects
- Remove weak or noisy observations
- Remove duplicate findings
- Keep only meaningful engineering concerns
- Assign severity levels carefully
- Assign confidence levels carefully
- Preserve repository-aware concerns when meaningful

IMPORTANT RULES:
- Do NOT invent new issues
- Do NOT add new observations
- Only refine existing findings
- Prefer precision over quantity
- Ignore speculative observations
- Keep findings concise
- file field should contain filename only if clearly visible
- suggestion should be short and actionable
- Return ONLY valid JSON
- No markdown
- No explanations
- No trailing commas

ISSUE TYPE RULES:
- bug → logic/runtime issue
- maintainability → hard to maintain or extend
- readability → difficult to read or understand
- architecture → violates repository structure/design
- performance → inefficient or scalability concern
- security → auth, secrets, validation, exposure risks
- dependency → package/configuration/dependency concern

SEVERITY RULES:
- high → production risk, security risk, major bug
- medium → maintainability/design/performance concern
- low → readability/minor concern

CONFIDENCE RULES:
- high → clearly visible in diff
- medium → likely concern with reasonable evidence
- low → weak signal but still potentially useful

JSON FORMAT:

{
  "summary": "one concise sentence summarizing the review",

  "issues": [
    {
      "type": "bug | maintainability | readability | architecture | performance | security | dependency",

      "severity": "low | medium | high",

      "confidence": "low | medium | high",

      "file": "optional filename",

      "message": "issue description",

      "suggestion": "optional actionable suggestion"
    }
  ],

  "metrics": {
    "high": 0,
    "medium": 0,
    "low": 0
  }
}

RAW REVIEW:

${rawReview}
`;

  logAgentStep(
    "reviewClassifierAgent",
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
    max_tokens: 1500
  };

  const data = await callAI(payload);

  const result =
    data.choices?.[0]?.message?.content || "";

  if (!result) {

    logAgentStep(
      "reviewClassifierAgent",
      "EMPTY_RESPONSE",
      data
    );

    return EMPTY_REVIEW;
  }

  logAgentOutput(
    "reviewClassifierAgent",
    result
  );

  try {

    const cleaned = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed: StructuredReview =
      JSON.parse(cleaned);

    parsed.metrics = {
      high: parsed.issues.filter(
        issue => issue.severity === "high"
      ).length,

      medium: parsed.issues.filter(
        issue => issue.severity === "medium"
      ).length,

      low: parsed.issues.filter(
        issue => issue.severity === "low"
      ).length
    };

    logAgentStep(
      "reviewClassifierAgent",
      "PARSED_OUTPUT",
      parsed
    );

    return parsed;

  } catch (error) {

    logAgentStep(
      "reviewClassifierAgent",
      "JSON_PARSE_ERROR",
      {
        error,
        result
      }
    );

    return EMPTY_REVIEW;
  }
};