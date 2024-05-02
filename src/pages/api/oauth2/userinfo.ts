import { getKeyStore } from "@/helpers/token";
import jwt from "jsonwebtoken";
import jwktopem from "jwk-to-pem";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  console.error(`GET /oauth2/userinfo - Initiated`);

  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    console.error(`GET /oauth2/userinfo - Error: Unauthorized`);

    res.statusCode = 401;
    res.statusMessage = "unauthorized";

    res.status(401).json({});
    return;
  }

  try {
    console.error(`GET /oauth2/userinfo - Validating JWT`);

    const keyStore = await getKeyStore();
    const keys = (keyStore.toJSON() as any).keys;

    const [key] = keys.filter(
      (k: { use: string; kty: string }) => k.use === "sig" && k.kty === "RSA"
    );

    const publicKey = jwktopem(key);
    const claims = jwt.verify(token, publicKey);

    console.error(`GET /oauth2/userinfo - Token validated.`);

    res.status(200).json(claims);
  } catch (error) {
    console.error(`GET /oauth2/userinfo - Error: ${JSON.stringify(error)}`);

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
