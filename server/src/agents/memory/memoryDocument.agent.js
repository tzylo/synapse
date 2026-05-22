import { callAI } from "../../config/openrouter.client.js";

import {
  logAgentOutput,
  logAgentStep
} from "../../utils/agent.logger.js";

export const generateMemoryDocument = async (
  input
) => {

  const {
    diff,
    prTitle,
    prDescription
  } = input;

  const safeDiff =
    diff.length > 15000
      ? diff.substring(0, 15000)
      : diff;

  logAgentStep(
    "memoryDocumentAgent",
    "INPUT",
    {
      prTitle,
      prDescription
    }
  );

  logAgentStep(
    "memoryDocumentAgent",
    "DIFF_INFO",
    {
      originalLength: diff.length,
      truncatedLength: safeDiff.length,
      wasTruncated: diff.length > 15000
    }
  );

  const prompt = `
You are a senior software engineer responsible for preserving long-term repository engineering memory.

Your role is NOT:
- changelog generation
- release note writing
- tutorial writing
- architectural storytelling
- engineering philosophy discussion

Your role IS:
- extracting durable engineering knowledge from a pull request
- preserving repository understanding
- documenting important system behavior and responsibilities
- compressing engineering context into dense technical memory

The generated memory should help:
- future engineers
- maintainers
- onboarding developers
- AI coding agents

understand the repository more efficiently.

==================================================
CORE OBJECTIVES
==================================================

Focus on:
- system behavior changes
- initialization flows
- important responsibilities
- runtime behavior
- architectural boundaries
- configuration behavior
- important constraints
- component interactions
- important assumptions visible in the diff

==================================================
IMPORTANT RULES
==================================================

- Only describe information directly visible in the diff
- Do NOT invent business logic
- Do NOT hallucinate architecture
- Do NOT speculate beyond reasonable evidence
- Do NOT explain obvious concepts
- Do NOT generate tutorial-style documentation
- Do NOT write release notes
- Do NOT generate generic maintainability commentary
- Do NOT discuss coding standards unless directly visible
- Do NOT discuss engineering culture
- Avoid generic architectural philosophy
- Avoid repetitive wording
- Avoid excessive section headings
- Avoid raw code walkthroughs
- Avoid line-by-line explanations
- Avoid essay-style writing
- Avoid introductory filler

==================================================
WRITING STYLE
==================================================

- Prefer dense engineering knowledge
- Prefer factual technical memory
- Prefer compact high-signal explanations
- Every paragraph should contain concrete repository knowledge
- Write like internal engineering memory
- Keep explanations grounded in observable code behavior
- Optimize for future retrieval by humans and coding agents
- Use markdown
- Keep tone technical, calm, and concise

==================================================
GOOD MEMORY EXAMPLES
==================================================

GOOD:
"The logger initialization flow now validates \`logFilePath\` before transport configuration is created, preventing invalid runtime logging setups."

GOOD:
"Development logging transports were refactored from nested conditional spread logic into explicit transport arrays, reducing branching complexity during logger initialization."

BAD:
"This documentation explores improvements made to the logging architecture."

BAD:
"These changes improve maintainability and developer experience."

BAD:
"The repository follows strong architectural principles."

==================================================
PR TITLE
==================================================

${prTitle || "N/A"}

==================================================
PR DESCRIPTION
==================================================

${prDescription || "N/A"}

==================================================
OUTPUT FORMAT
==================================================

# Engineering Memory

Write compact markdown engineering memory describing the important repository knowledge introduced or modified by this pull request.

Prefer:
- behavior changes
- flows
- responsibilities
- runtime behavior
- boundaries
- constraints
- important architectural understanding

Avoid:
- changelog phrasing
- educational writing
- generic explanations
- obvious observations
- filler content

==================================================
PR DIFF
==================================================

${safeDiff}
`;

  logAgentStep(
    "memoryDocumentAgent",
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
    max_tokens: 1400
  };

  const data = await callAI(payload);

  const result =
    data.choices?.[0]?.message?.content || "";

  if (!result) {

    logAgentStep(
      "memoryDocumentAgent",
      "EMPTY_RESPONSE",
      data
    );

    return "";
  }

  logAgentOutput(
    "memoryDocumentAgent",
    result
  );

  return result.trim();
};