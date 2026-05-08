const isCritical = (issue) =>
  ["blocker", "critical"].includes(issue.severity?.toLowerCase());

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
  const { review, documentation } = data;
  const issues = review?.issues || [];
  const questions = documentation?.questions || [];

  let comment = `**Tzylo Synapse** · ${review?.summary || ''}\n\n`;

  // Issues section
  if (issues.length === 0) {
    comment += `✅ No critical issues found\n`;
  } else {
    issues.forEach((issue, i) => {
      comment += `**${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}**\n`;
      if (issue.file) comment += `- File: \`${issue.file}\`\n`;
      if (issue.suggestion) comment += `- Fix: ${issue.suggestion}\n`;
      comment += `\n`;
    });
    comment += `Risk: ${getRiskLevel(issues)}\n`;
  }

  // Questions section
  if (questions.length > 0) {
    comment += `\n---\n`;
    questions.forEach((q, i) => {
      comment += `**${i + 1}.** ${q}\n`;
    });
  }

  return comment;
};