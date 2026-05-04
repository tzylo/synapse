import axios from "axios";

export const fetchPRDiff = async (prUrl) => {
  if (!prUrl.includes("github.com") || !prUrl.includes("/pull/")) {
    throw new Error("Invalid PR URL");
  }

  const diffUrl = `${prUrl}.diff`;

  const response = await axios.get(diffUrl);

  return response.data;
};