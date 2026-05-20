import jwt from 'jsonwebtoken';
import fs from 'fs';
import ENV from '../config/env';

const generateJWT = () => {
  const privateKey = fs.readFileSync(ENV.GITHUB.PRIVATE_KEY_PATH, "utf8");

  return jwt.sign(
    {
      iat: Math.floor(Date.now() / 1000) - 60,
      exp: Math.floor(Date.now() / 1000) + (10 * 60),
      iss: ENV.GITHUB.APP_ID,
    },
    privateKey,
    { algorithm: 'RS256' }
  );
};

export default generateJWT;