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

  console.log(`POST /api/oauth2/authorize/oidc - Initiating`);

  try {
    const body: { state: string; nonce: string; redirectUri: string } =
      await req.body;

    console.log(
      `POST /api/oauth2/authorize/oidc - Body: ${JSON.stringify(body, null, 4)}`
    );

    const auth_flow = await AuthenticationFlowDocument.create({
      type: "oidc",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      redirectUri: body.redirectUri,
    });

    console.log(`POST /api/oauth2/authorize/oidc - Created. ${auth_flow.code}`);

    res.status(200).json(auth_flow);
  } catch (error) {
    console.error(
      `POST /api/oauth2/authorize/oidc - Error: ${JSON.stringify(
        error,
        null,
        4
      )}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
