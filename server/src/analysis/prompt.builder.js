export const buildPrompt = (input) => {
  const { diff } = input;

  const safeDiff = diff.length > 12000 ? diff.substring(0, 12000) : diff;

return `
You are a senior software engineer reviewing a pull request.

STRICT RULES:
- Only report issues clearly visible in the diff
- Do NOT assume missing logic
- Do NOT give generic advice
- If no real issues: return empty issues array
- Keep output concise and factual
- Only include meaningful changes, avoid trivial formatting mentions unless important

Return JSON ONLY (no markdown, no explanation):

{
  "review": {
    "summary": "short summary",
    "issues": [
      {
        "type": "bug | quality | performance | security",
        "severity": "low | medium | high",
        "file": "filename",
        "message": "issue description",
        "suggestion": "fix suggestion"
      }
    ]
  },
  "documentation": {
    "summary": "what this PR does",
    "sections": [
      {
        "title": "section name",
        "action": "add | update",
        "content": ["point 1", "point 2"]
      }
    ]
  }
}

DIFF:
${safeDiff}
`;
};