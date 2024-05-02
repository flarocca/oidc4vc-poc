import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import jose from "node-jose";
import { getKeyStore } from "@/app/helpers/token";
import { NextRequest } from "next/server";

type Params = {
  txid: string;
};

export async function GET(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(`GET /api/siop/requests/${txid} - Initiated`);

  try {
    const result = await AuthenticationFlow.updateOne(
      {
        type: "siop",
        code: txid,
      },
      {
        status: "scanned",
      }
    );

    const auth_flow = await AuthenticationFlow.findOne({
      type: "siop",
      code: txid,
    });

    console.log(`GET /api/siop/requests/${txid} - Found`);

    const keyStore = await getKeyStore();
    const [key] = keyStore.all({ use: "sig", kty: "EC" });
    const did = `did:jwk:${Buffer.from(JSON.stringify(key.toJSON())).toString(
      "base64"
    )}`;

    const dt = new Date();
    const payload = {
      iat: Math.floor(dt.getTime() / 1000),
      exp: Math.floor(
        (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
      ),
      response_type: "vp_token",
      scope: "openid",
      client_id: did,
      response_uri: `${
        process.env.EXTERNAL_SERVER_URI as string
      }/api/siop/responses/${txid}`,
      response_mode: "post",
      nonce: auth_flow.nonce,
      state: auth_flow.state,
      client_metadata: {
        id_token_signing_alg_values_supported: ["EdDSA", "ES256", "ES256K"],
        request_object_signing_alg_values_supported: [
          "EdDSA",
          "ES256",
          "ES256K",
        ],
        response_types_supported: ["id_token"],
        scopes_supported: ["openid did_authn"],
        subject_types_supported: ["pairwise"],
        subject_syntax_types_supported: ["did:key", "did:jwk"],
        vp_formats: {
          jwt_vc: {
            alg: ["EdDSA", "ES256K"],
          },
          jwt_vp: {
            alg: ["ES256K", "EdDSA"],
          },
        },
      },
      // claims: {
      //   vp_token: {
      presentation_definition: {
        id: "authn-with-vc",
        purpose: "Authentication using VCs",
        input_descriptors: [
          {
            id: "basic-information",
            name: "Basic Information",
            purpose: "Authenticate you using basic information",
            constraints: {
              fields: [
                {
                  path: [
                    "$.credentialSubject.email",
                    "$.vc.credentialSubject.email",
                    "$.credentialSubject.emailAddress",
                    "$.vc.credentialSubject.emailAddress",
                  ],
                },
              ],
            },
          },
        ],
      },
      //   },
      // },
      nbf: Math.floor(dt.getTime() / 1000),
      jti: "f4c8373d-d5ae-4eef-bf43-8da13f6ff5dd",
      iss: did,
      sub: did,
    };

    const opt = { compact: true, protect: "*", fields: { typ: "JWT" } };

    const token = await jose.JWS.createSign(opt, key)
      .update(JSON.stringify(payload))
      .final();

    console.log(`GET /api/siop/requests/${txid} - Complete`);

    // create vc presentation JWT

    return new Response(token as unknown as string, {
      status: 200,
    });
  } catch (error) {
    console.error(
      `GET /api/siop/requests/${txid} - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "internal_server_erorr" }
    );
  }
}
