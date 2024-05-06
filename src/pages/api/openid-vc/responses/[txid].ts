import { extractClaimsFromVpToken } from "@/helpers/verifiableCredentials";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
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

  await dbConnect();

  const { txid } = req.query;

  console.log(
    `[OIDC Operational] POST /api/openid-vc/responses/${txid} - Received`
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

    const openidVcFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "in-process",
      }
    ).exec();

    console.log(
      `[OIDC Operational] POST /api/openid-vc/responses/${txid} - TRX Found`
    );

    const claims = extractClaimsFromVpToken(data.vp_token);

    console.log(
      `[OIDC Operational] POST /api/openid-vc/responses/${txid} - Claims extracted`
    );

    await AuthenticationFlowDocument.create({
      type: "oidc",
      code: openidVcFlow.code,
      state: openidVcFlow.state,
      nonce: openidVcFlow.nonce,
      redirectUri: openidVcFlow.redirectUri,
      status: "initiated",
      data: claims,
    });

    await AuthenticationFlowDocument.updateOne(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "complete",
      }
    ).exec();

    console.log(
      `[OIDC Operational] POST /api/openid-vc/responses/${txid} - Complete`
    );

    res.status(204).end();
  } catch (error) {
    console.error(
      `[OIDC Operational] POST /api/openid-vc/responses/${txid} - Error: ${JSON.stringify(
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
