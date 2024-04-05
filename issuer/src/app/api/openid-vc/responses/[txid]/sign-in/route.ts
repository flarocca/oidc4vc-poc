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
    const cred: {
      credentialSubject: any;
    } = jwtDecode(vc);

    Object.keys(cred.credentialSubject).forEach((key) => {
      claims[key] = cred.credentialSubject[key];
    });
  });

  return claims;
};

export async function POST(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(
    `/api/openid-vc/responses/${txid}/sign-in - VC Response received`
  );

  const data: any = await req.text();
  const url = new URL(`${process.env.EXTERNAL_SERVER_URI}?${data}`);
  const vpToken = url.searchParams.get("vp_token");

  console.log(
    `/api/openid-vc/responses/${txid}/sign-in - Payload read. VP Token: ${vpToken}`
  );

  if (!vpToken) {
    return Response.json(
      { success: false, error: "invalid_vp_token" },
      { status: 400, statusText: "bad_request" }
    );
  }

  // 1. Update txid
  const openid_vc_flow = await AuthenticationFlow.findOneAndUpdate(
    {
      type: "openid-vc",
      code: txid,
    },
    {
      status: "in-process",
    }
  );

  // 2. Parse response
  const payload: {
    vp: { verifiableCredential: string[] };
  } = jwtDecode(vpToken);

  const claims = extractClaims(payload.vp.verifiableCredential);

  // 3. Create Auth Code Flow
  await AuthenticationFlow.create({
    type: "oidc",
    code: openid_vc_flow.code,
    state: openid_vc_flow.state,
    nonce: openid_vc_flow.nonce,
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

  // 4. Modify UI to automatically redirect to RP's callback

  return new Response(null, {
    status: 204,
  });
}
