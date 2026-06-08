import axios from "axios";
import ENV from "./env.js";

const OPENROUTER_URL =
  "https://api.aicredits.in/v1/chat/completions";

export const callAI = async (payload) => {
  try {
    const response = await axios.post(
      OPENROUTER_URL,
      payload,
      {
        headers: {
          Authorization: `Bearer ${ENV.AICREDITS.API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    return response.data;

  } catch (error) {
    if (error.response) {
      console.error("OpenRouter Error:", error.response.data);
      console.log(JSON.stringify(error.response.data, null, 2));
      throw new Error(
        `AI failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`
      );
    }

    throw new Error("AI request failed");
  }
};