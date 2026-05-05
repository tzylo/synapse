// github.writer.js

import axios from "axios";
import { updateTzyloDoc } from "../agents/writer.agent.js";

const GITHUB_API = "https://api.github.com";

// 🔒 safety guard
const ALLOWED_FILE = "TZYLO.md";

// -----------------------------
// 1. Get file from repo
// -----------------------------
const getFile = async ({ owner, repo, path, token }) => {
  try {
    const res = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    return {
      content: Buffer.from(res.data.content, "base64").toString("utf8"),
      sha: res.data.sha,
    };
  } catch (err) {
    // file doesn't exist → create new
    if (err.response?.status === 404) {
      return {
        content: getEmptyDoc(),
        sha: null,
      };
    }

    throw err;
  }
};

// -----------------------------
// 2. Default tzylo.md template
// -----------------------------
const getEmptyDoc = () => `
# 🤖 Tzylo Documentation

> Auto-generated documentation based on Pull Requests.

---

## ⚙️ Environment Variables
<!-- TZYLO:ENV_START -->
<!-- TZYLO:ENV_END -->

---

## 🧱 Architecture / Refactors
<!-- TZYLO:ARCH_START -->
<!-- TZYLO:ARCH_END -->

---

## 🔌 API Changes
<!-- TZYLO:API_START -->
<!-- TZYLO:API_END -->

---

## 📦 Dependencies / Setup
<!-- TZYLO:DEP_START -->
<!-- TZYLO:DEP_END -->

---

## 📝 General Notes
<!-- TZYLO:GEN_START -->
<!-- TZYLO:GEN_END -->
`;

// -----------------------------
// 3. Commit file
// -----------------------------
const commitFile = async ({
  owner,
  repo,
  path,
  content,
  sha,
  token,
  message,
  branch,
}) => {
  const body = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch,
  };

  if (sha) {
    body.sha = sha; // required for update
  }

  await axios.put(
    `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
};

// -----------------------------
// 4. Main function
// -----------------------------
export const updateTzyloDocumentation = async ({
  owner,
  repo,
  prNumber,
  sections,
  token,
  branch, // IMPORTANT → use PR branch
}) => {
  if (ALLOWED_FILE !== "tzylo.md") {
    throw new Error("Blocked: unauthorized file");
  }

  // Step 1: fetch existing doc
  const { content: existingDoc, sha } = await getFile({
    owner,
    repo,
    path: ALLOWED_FILE,
    token,
  });

  // Step 2: update using writer agent
  const updatedDoc = updateTzyloDoc({
    existingDoc,
    sections,
    prNumber,
  });

  // Step 3: commit back
  await commitFile({
    owner,
    repo,
    path: ALLOWED_FILE,
    content: updatedDoc,
    sha,
    token,
    branch,
    message: `docs(tzylo): update from PR #${prNumber}`,
  });
};