import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";
import { URL } from "url";
import { jwtDecode } from "jwt-decode";

type Params = {
  txid: string;
};

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

export async function POST(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(`POST /api/openid-vc/responses/${txid}/sign-in - Received`);

  try {
    const data: any = await req.text();
    const url = new URL(`${process.env.EXTERNAL_SERVER_URI}?${data}`);
    const vpToken = url.searchParams.get("vp_token");

    console.log(`POST /api/openid-vc/responses/${txid}/sign-in - Payload read`);

    if (!vpToken) {
      return Response.json(
        { success: false, error: "invalid_vp_token" },
        { status: 400, statusText: "bad_request" }
      );
    }

    const openid_vc_flow = await AuthenticationFlow.findOneAndUpdate(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "in-process",
      }
    );

    console.log(`POST /api/openid-vc/responses/${txid}/sign-in - TRX Found`);

    const payload: {
      vp: { verifiableCredential: string[] };
    } = jwtDecode(vpToken);

    const claims = extractClaims(payload.vp.verifiableCredential);

    console.log(
      `POST /api/openid-vc/responses/${txid}/sign-in - Claims extracted`
    );

    await AuthenticationFlow.create({
      type: "oidc",
      code: openid_vc_flow.code,
      state: openid_vc_flow.state,
      nonce: openid_vc_flow.nonce,
      redirectUri: openid_vc_flow.redirectUri,
      status: "initiated",
      data: claims,
    });

    await AuthenticationFlow.updateOne(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "complete",
      }
    );

    console.log(`POST /api/openid-vc/responses/${txid}/sign-in - Complete`);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    console.error(
      `POST /api/openid-vc/responses/${txid}/sign-in - Error: ${JSON.stringify(
        error
      )}`
    );
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
