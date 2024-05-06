import { createSignedPresentationDefinition } from "@/helpers/verifiableCredentials";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
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

  await dbConnect();

  const { txid } = req.query;

  console.log(
    `[OIDC Operational] GET /api/openid-vc/requests/${txid} - Scanned`
  );

  try {
    const authFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(
      `[OIDC Operational] GET /api/openid-vc/requests/${txid} - Found`
    );

    const signedPresentationDefinition =
      await createSignedPresentationDefinition({
        redirectUri: `${
          process.env.ISSUER as string
        }/openid-vc/responses/${txid}`,
        nonce: authFlow.nonce,
        state: authFlow.state,
        requirePii: authFlow.data.requirePii,
        requireEmailVerified: authFlow.data.requireEmailVerified,
        requireKyc: authFlow.data.requireKyc,
      });

    console.log(
      `[OIDC Operational] GET /api/openid-vc/requests/${txid} - Complete.`
    );

    res.status(200).end(signedPresentationDefinition);
  } catch (error) {
    console.error(
      `[OIDC Operational] GET /api/openid-vc/requests/${txid} - Error: ${JSON.stringify(
        error
      )}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
