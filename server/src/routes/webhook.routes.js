import express from "express";
import crypto from "crypto";
import { reviewService } from "../review/review.service.js";
import { docsWriter } from "../doc/doc.writer.js";
import { getCachedPROutput, clearPRCache } from "../utils/cache.js";

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

        let result;

        if (["opened", "synchronize"].includes(action)) {
          const pr = payload.pull_request;

          const prUrl = pr.html_url;
          const repo = payload.repository.full_name;
          const prNumber = pr.number;
          const installationId = payload.installation.id;
          const prApiUrl = pr.url;

          console.log("Processing PR:", prUrl);

          result = await reviewService({prApiUrl, installationId});

          console.log("Comment posted ✅");
        }
      

      if (action === "closed" && payload.pull_request.merged) {

        const pr = payload.pull_request;
        const prApiUrl = pr.url;
        const installationId = payload.installation.id;
        const branch = payload.pull_request.base.ref;

        const cached = getCachedPROutput(prApiUrl);

        if (cached) {
          await docsWriter({prApiUrl, installationId, sections: cached.documentation.sections, branch});
          clearPRCache(prApiUrl);
        }

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