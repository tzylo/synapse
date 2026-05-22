import { callAI } from "../../config/openrouter.client.js";

import {
  logAgentOutput,
  logAgentStep
} from "../../utils/agent.logger.js";


export const updateSectionMemory = async (
  input
) => {

  const {
    sectionTitle,
    existingContent,
    newMemory
  } = input;

  logAgentStep(
    "sectionUpdaterAgent",
    "INPUT",
    {
      sectionTitle,
      existingContent,
      newMemory
    }
  );

  const prompt = `
You are a senior software engineer responsible for maintaining long-term repository memory.

You are updating a documentation section inside TZYLO.md.

Your job is to merge NEW engineering memory into the EXISTING section content.

IMPORTANT GOALS:
- Preserve important existing knowledge
- Integrate new knowledge naturally
- Avoid duplicate information
- Keep documentation readable and structured
- Maintain long-term engineering understanding
- Prefer explanation over changelog entries

IMPORTANT RULES:
- Do NOT remove important existing information
- Do NOT rewrite unrelated content
- Do NOT append repetitive bullet points
- Do NOT invent architecture or flows
- Do NOT speculate beyond visible evidence
- Keep documentation concise but descriptive
- Preserve markdown formatting
- Return ONLY updated markdown content
- No code fences
- No explanations outside markdown

SECTION NAME:
${sectionTitle}

EXISTING SECTION CONTENT:

${existingContent || "(empty section)"}

NEW ENGINEERING MEMORY:

${newMemory}

TASK:

Update the section by naturally integrating the new engineering knowledge into the existing documentation.

Prefer:
- cohesive explanations
- architectural clarity
- system understanding
- engineering readability

Avoid:
- changelog style
- duplicate statements
- noisy bullet accumulation
`;

  logAgentStep(
    "sectionUpdaterAgent",
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
    max_tokens: 1800
  };

  const data = await callAI(payload);

  const result =
    data.choices?.[0]?.message?.content || "";

  if (!result) {

    logAgentStep(
      "sectionUpdaterAgent",
      "EMPTY_RESPONSE",
      data
    );

    return existingContent;
  }

  logAgentOutput(
    "sectionUpdaterAgent",
    result
  );

  return result.trim();
};