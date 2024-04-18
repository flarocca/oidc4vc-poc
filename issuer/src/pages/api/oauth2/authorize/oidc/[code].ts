import dbConnect from "@/lib/dbConnect";
import type { NextApiRequest, NextApiResponse } from "next";
import AuthenticationFlowDocument from "@/models/authenticationFlow";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  await dbConnect();

  const { code } = req.query;

  console.log(`GET /api/oauth2/authorize/oidc/${code} - Initiating`);

  try {
    const auth_flow = await AuthenticationFlowDocument.findOne({
      type: "oidc",
      code,
    }).exec();

    console.log(`GET /api/oauth2/authorize/oidc/${code} - Found`);

    res.status(200).json({
      code: auth_flow.code,
      redirectUri: auth_flow.redirectUri,
      state: auth_flow.state,
    });
  } catch (error) {
    console.error(
      `GET /api/oauth2/authorize/oidc/${code} - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
