import dbConnect from "@/lib/dbConnect";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import AuthenticationFlowDocument from "@/models/authenticationFlow";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  await dbConnect();

  console.info(`POST /api/oauth2/authorize/siop - Initiated`);

  try {
    const body: { state: string; nonce: string; redirectUri: string } =
      await req.body;

    const auth_flow = await AuthenticationFlowDocument.create({
      type: "siop",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      status: "initiated",
      redirectUri: body.redirectUri,
    });

    console.info(
      `POST /api/oauth2/authorize/siop - Created: ${auth_flow.code}`
    );

    res.status(200).json({
      code: auth_flow.code,
    });
  } catch (error) {
    console.info(
      `POST /api/oauth2/authorize/siop - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
