import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { txid } = req.query;

  console.error(`GET /api/siop/responses/${txid} - Initiated`);

  try {
    console.error(`GET /api/siop/responses/${txid} - Found`);

    console.error(`GET /api/siop/responses/${txid} - Complete`);

    res.status(200).json({});
  } catch (error) {
    console.error(
      `GET /api/siop/responses/${txid} - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
