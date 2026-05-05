import express from "express";
import ENV from "./config/env.js";
import githubRoutes from "./routes/github.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";

const app = express();

app.use("/api/webhook", webhookRoutes);

app.use(express.json());

app.use("/api/github", githubRoutes);
app.use("/api/review", reviewRoutes);

app.get("/", (req, res) => {
  res.send("Sentra is running 🚀");
});

app.listen(ENV.PORT, () => {
  console.log(`Server running on port http://localhost:${ENV.PORT}`);
});