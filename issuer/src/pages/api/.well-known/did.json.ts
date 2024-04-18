import type { NextApiRequest, NextApiResponse } from "next";
import { getIssuer } from "@/helpers/issuer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  console.log(`GET /.well-known/did.json`);

  const issuer = await getIssuer();

  res.status(200).json(issuer.document);
}
