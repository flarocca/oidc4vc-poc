import type { NextApiRequest, NextApiResponse } from "next";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { extractClaimsFromVpToken } from "@/helpers/verifiableCredentials";

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

  console.error(
    `[OIDC Operational] POST /api/siop/responses/${txid} - Initiated`
  );

  try {
    const data: { vp_token: string } = req.body;

    console.log(
      `[OIDC Operational] POST /api/openid-vc/responses/${txid} - Data: ${JSON.stringify(
        data,
        null,
        4
      )}`
    );

    if (!data.vp_token) {
      res.statusCode = 400;
      res.statusMessage = "bad_request";

      res.status(400).json({ success: false, error: "invalid_vp_token" });

      return;
    }

    const authFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "siop",
        code: txid,
      },
      {
        status: "in-process",
      }
    ).exec();

    console.log(
      `[OIDC Operational] POST /api/siop/responses/${txid} - TRX Found`
    );

    const claims = extractClaimsFromVpToken(data.vp_token);

    await AuthenticationFlowDocument.create({
      type: "oidc",
      code: authFlow.code,
      state: authFlow.state,
      nonce: authFlow.nonce,
      redirectUri: authFlow.redirectUri,
      status: "initiated",
      data: claims,
    });

    await AuthenticationFlowDocument.updateOne(
      {
        type: "siop",
        code: txid,
      },
      {
        status: "complete",
      }
    ).exec();

    console.error(
      `[OIDC Operational] POST /api/siop/responses/${txid} - Complete`
    );

    res.status(204).end();
  } catch (error) {
    console.error(
      `[OIDC Operational] POST /api/siop/responses/${txid} - Error: ${JSON.stringify(
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
