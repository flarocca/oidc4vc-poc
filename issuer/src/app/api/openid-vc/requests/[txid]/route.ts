import dbConnect from "@/lib/dbConnect";
import { NextApiRequest } from "next";
import AuthenticationFlow from "@/models/authentication_flow";
import jose from "node-jose";
import { getKeyStore } from "@/app/helpers/token";
import createVpPayload from "@/app/helpers/createVpPayload";

type Params = {
  txid: string;
};

export async function GET(req: NextApiRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(`GET /api/openid-vc/requests/${txid} - Scanned`);

  try {
    const auth_flow = await AuthenticationFlow.findOneAndUpdate(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "scanned",
      }
    );

    console.log(`GET /api/openid-vc/requests/${txid} - Found`);

    const keyStore = await getKeyStore();
    const [key] = keyStore.all({ use: "sig", kty: "EC" });
    const did = `did:jwk:${Buffer.from(JSON.stringify(key.toJSON())).toString(
      "base64"
    )}`;

    const payload = createVpPayload({
      did,
      txid,
      nonce: auth_flow.nonce,
      state: auth_flow.state,
      requirePii: auth_flow.data.requirePii,
      requireEmailVerified: auth_flow.data.requireEmailVerified,
      requireKyc: auth_flow.data.requireKyc,
    });

    const opt = { compact: true, protect: "*", fields: { typ: "JWT" } };

    const token = await jose.JWS.createSign(opt, key)
      .update(JSON.stringify(payload))
      .final();

    console.log(`GET /api/openid-vc/requests/${txid} - Complete.`);

    return new Response(token as unknown as string, {
      status: 200,
    });
  } catch (error) {
    console.error(
      `/api/openid-vc/requests/${txid} - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false, error },
      { status: 400, statusText: "bad_request" }
    );
  }
}
