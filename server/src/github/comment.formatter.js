export const formatComment = (data) => {
  const { review, documentation } = data;

  let comment = `## 🤖 Tzylo PR Review\n\n`;

  comment += `### 📌 Summary\n${review.summary}\n\n`;

  if (review.issues.length) {
    comment += `### ⚠️ Issues\n`;

    review.issues.forEach((issue, i) => {
      comment += `**${i + 1}. [${issue.severity.toUpperCase()}] ${issue.message}**\n`;
      comment += `- File: ${issue.file}\n`;
      comment += `- Suggestion: ${issue.suggestion}\n\n`;
    });
  } else {
    comment += `### ✅ No major issues found\n\n`;
  }

  comment += `### 📘 Documentation\n`;
  comment += `${documentation.summary}\n\n`;

  documentation.changes.forEach(c => {
    comment += `- ${c}\n`;
  });

  return comment;
};