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
  const issues = (data?.review?.issues || []).filter(issue =>
    isCritical(issue)
  );

  // 🟢 No issues → minimal output
  if (issues.length === 0) {
    return `✅ No critical issues found\nRisk: Very Low`;
  }

  // 🔴 Issues exist → show only important ones
  let comment = `⚠️ Critical Issues Detected\n\n`;

  issues.forEach((issue, i) => {
    comment += `**${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}**\n`;
    
    if (issue.file) {
      comment += `- File: ${issue.file}\n`;
    }

    if (issue.suggestion) {
      comment += `- Fix: ${issue.suggestion}\n`;
    }

    comment += `\n`;
  });

  comment += `Risk: ${getRiskLevel(issues)}`;

  return comment;
};