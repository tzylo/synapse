import axios from "axios";
import ENV from "../config/env.js";

export const postPRComment = async (prUrl, comment) => {
  const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);

  if (!match) throw new Error("Invalid PR URL");

  const [, owner, repo, prNumber] = match;

  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

  await axios.post(
    url,
    { body: comment },
    {
      headers: {
        Authorization: `Bearer ${ENV.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
};