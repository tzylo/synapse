import express from "express";
import crypto from "crypto";
import { reviewService } from "../review/review.service.js";
import { formatComment } from "../github/comment.formatter.js";
import { postPRComment } from "../github/github.comment.js";

const router = express.Router();

router.post(
  "/github",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      const signature = req.headers["x-hub-signature-256"];
      const secret = process.env.GITHUB_WEBHOOK_SECRET;

      const hmac = crypto.createHmac("sha256", secret);
      const digest = "sha256=" + hmac.update(req.body).digest("hex");

      if (signature !== digest) {
        return res.status(401).send("Invalid signature");
      }

      const payload = JSON.parse(req.body.toString());
      const event = req.headers["x-github-event"];

      if (event === "pull_request") {
        const action = payload.action;

        if (["opened", "synchronize"].includes(action)) {
          const pr = payload.pull_request;

          const prUrl = pr.html_url;
          const repo = payload.repository.full_name;
          const prNumber = pr.number;
          const installationId = payload.installation.id;
          const prApiUrl = pr.url;

          console.log("Processing PR:", prUrl);

          await reviewService({prApiUrl, installationId});

          console.log("Comment posted ✅");
        }
      

      if (action === "closed" && payload.pull_request.merged) {
    const pr = payload.pull_request;
    const owner = payload.repository.owner.login;
    const repo = payload.repository.name;
    const prNumber = pr.number;
    const branch = pr.base.ref; // merged into base branch

    console.log("PR merged, updating docs:", prNumber);

    await updateTzyloDocumentation({
      owner,
      repo,
      prNumber,
      sections, // coming from your LLM output
      token,    // your installation token
      branch,
    });

    console.log("TZYLO.md updated ✅");
      }
    }

      res.status(200).json({ success: true });
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;