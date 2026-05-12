const getRiskLevel = (issues) => {
  const max = Math.max(
    ...issues.map((i) => {
      if (i.severity === "blocker") return 4;
      if (i.severity === "critical") return 3;
      return 2;
    })
  );

  return max === 4
    ? "Very High"
    : max === 3
      ? "High"
      : "Medium";
};


export const formatComment = (data) => {
  const { issues = [], clarifications = [] } = data;

  let comment = "";

  // Issues
  if (issues.length === 0) {
    comment += `✅ No critical issues found.`;
  } else {
    issues.forEach((issue, i) => {
      comment += `**${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}**\n`;

      if (issue.file) {
        comment += `- File: \`${issue.file}\`\n`;
      }

      if (issue.suggestion) {
        comment += `- Suggestion: ${issue.suggestion}\n`;
      }

      comment += `\n`;
    });

    comment += `Risk: ${getRiskLevel(issues)}\n`;
  }

  // Clarifications
  if (clarifications.length > 0) {
    comment += `\n---\n`;

    clarifications.forEach((question, i) => {
      comment += `**Question ${i + 1}:** ${question}\n`;
    });
  }

  return comment.trim();
};