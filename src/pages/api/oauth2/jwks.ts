import { getKeyStore } from "@/helpers/token";
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

  console.error(`GET /oauth2/jwks - Initiated`);

  try {
    const keyStore = (await getKeyStore()) as any;

    console.error(`GET /oauth2/jwks - Complete`);

    res.status(200).json(keyStore.toJSON());
  } catch (error) {
    console.error(`GET /oauth2/jwks - Error: ${JSON.stringify(error)}`);

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
