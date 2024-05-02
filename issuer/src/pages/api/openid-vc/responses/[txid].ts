import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { jwtDecode } from "jwt-decode";
import type { NextApiRequest, NextApiResponse } from "next";

const extractClaims = (verifiableCredential: string[]): string[] => {
  let claims: any = {};

  verifiableCredential.forEach((vc) => {
    const cred = jwtDecode<{ sub: string; vc: any; credentialSubject: any }>(
      vc
    );
    const credentialSubject = cred.vc
      ? cred.vc.credentialSubject
      : cred.credentialSubject;

    claims.sub = cred.sub;

    Object.keys(credentialSubject).forEach((key) => {
      claims[key] = credentialSubject[key];
    });
  });

  return claims;
};

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

  console.log(`POST /api/openid-vc/responses/${txid} - Received`);

  try {
    const data: { vp_token: string } = req.body;

    console.log(
      `POST /api/openid-vc/responses/${txid} - Data: ${JSON.stringify(
        data,
        null,
        4
      )}`
    );

    // const url = new URL(`${process.env.ISSUER}?${data}`);
    // const vpToken = url.searchParams.get("vp_token");

    console.log(
      `POST /api/openid-vc/responses/${txid} - Payload read: ${data.vp_token}`
    );

    if (!data.vp_token) {
      // return Response.json(
      //   { success: false, error: "invalid_vp_token" },
      //   { status: 400, statusText: "bad_request" }
      // );
      res.statusCode = 400;
      res.statusMessage = "bad_request";

      res.status(400).json({ success: false, error: "invalid_vp_token" });

      return;
    }

    const openid_vc_flow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "in-process",
      }
    ).exec();

    console.log(`POST /api/openid-vc/responses/${txid} - TRX Found`);

    const payload: {
      vp: { verifiableCredential: string[] };
    } = jwtDecode(data.vp_token);

    const claims = extractClaims(payload.vp.verifiableCredential);

    console.log(`POST /api/openid-vc/responses/${txid} - Claims extracted`);

    await AuthenticationFlowDocument.create({
      type: "oidc",
      code: openid_vc_flow.code,
      state: openid_vc_flow.state,
      nonce: openid_vc_flow.nonce,
      redirectUri: openid_vc_flow.redirectUri,
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

    console.log(`POST /api/openid-vc/responses/${txid} - Complete`);

    // return new Response(null, {
    //   status: 204,
    // });
    res.status(204).end();
  } catch (error) {
    console.error(
      `POST /api/openid-vc/responses/${txid} - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
