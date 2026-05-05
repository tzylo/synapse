import express from "express";
import crypto from "crypto";
import { reviewService } from "../review/review.service.js";
import { formatComment } from "../github/comment.formatter.js";
import { postPRComment } from "../github/github.comment.js";

const router = express.Router();

router.post(
  "/webhook",
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

          console.log("Processing PR:", prUrl);

          const result = await reviewService(prUrl);
          const comment = formatComment(result);

          await postPRComment(repo, prNumber, installationId, comment);

          console.log("Comment posted ✅");
        }
      }

      res.send("ok");
    } catch (err) {
      console.error("Webhook error:", err);
      res.status(500).send("error");
    }
  }
);

export default router;