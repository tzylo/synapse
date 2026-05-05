import axios from "axios";
import generateJWT from "./github.jwt.js";

export const getInstallationToken = async (installationId) => {
  const jwtToken = generateJWT();

  const response = await axios.post(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {},
    {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  return response.data.token;
};

export const fetchPRDiff = async (prApiUrl, installationId) => {
  if (!prApiUrl.includes("github.com")) {
    throw new Error("Invalid PR URL");
  }

  const token = await getInstallationToken(installationId);

  const response = await axios.get(prApiUrl, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};