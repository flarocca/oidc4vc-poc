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

  console.log(`GET /api/openid-vc/requests/${txid}/kyc-complete - Complete`);

  try {
    const result = await AuthenticationFlow.updateOne(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "scanned",
      }
    );

    const auth_flow = await AuthenticationFlow.findOne({
      type: "openid-vc",
      code: txid,
    });

    console.log(`GET /api/openid-vc/requests/${txid}/kyc-complete - Found`);

    const keyStore = await getKeyStore();
    const [key] = keyStore.all({ use: "sig", kty: "EC" });
    const did = `did:jwk:${Buffer.from(JSON.stringify(key.toJSON())).toString(
      "base64"
    )}`;

    const dt = new Date();
    const payload = {
      iat: Math.floor(dt.getTime() / 1000),
      nbf: Math.floor(dt.getTime() / 1000),
      exp: Math.floor(
        (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
      ),
      jti: "f4c8373d-d5ae-4eef-bf43-8da13f6ff5dd",
      response_mode: "post",
      response_type: "id_token",
      scope: "openid",
      client_id: did,
      iss: did,
      sub: did,
      redirect_uri: `${
        process.env.EXTERNAL_SERVER_URI as string
      }/api/openid-vc/responses/${txid}`,
      nonce: auth_flow.nonce,
      state: auth_flow.state,
      registration: {
        id_token_signing_alg_values_supported: ["EdDSA", "ES256", "ES256K"],
        request_object_signing_alg_values_supported: [
          "EdDSA",
          "ES256",
          "ES256K",
        ],
        response_types_supported: ["id_token"],
        scopes_supported: ["openid did_authn"],
        subject_types_supported: ["pairwise"],
        subject_syntax_types_supported: [
          "did:ethr",
          "did:key",
          "did:ion",
          "did:web",
          "did:jwk",
        ],
        vp_formats: {
          jwt_vc: {
            alg: ["EdDSA", "ES256K"],
          },
          jwt_vp: {
            alg: ["ES256K", "EdDSA"],
          },
        },
      },
      claims: {
        vp_token: {
          presentation_definition: {
            id: "demo-poc",
            purpose: "Just another demo",
            input_descriptors: [
              {
                id: "123-abc",
                name: "Descriptor 1",
                purpose: "Will see",
                constraints: {
                  fields: [
                    {
                      path: [
                        "$.credentialSubject.firstName",
                        "$.vc.credentialSubject.firstName",
                      ],
                    },
                    {
                      path: [
                        "$.credentialSubject.lastName",
                        "$.vc.credentialSubject.lastName",
                      ],
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    };

    const opt = { compact: true, protect: "*", fields: { typ: "JWT" } };

    const token = await jose.JWS.createSign(opt, key)
      .update(JSON.stringify(payload))
      .final();

    console.log(`GET /api/openid-vc/requests/${txid}/kyc-complete - Complete`);

    return new Response(token as unknown as string, {
      status: 200,
    });
  } catch (error) {
    console.log(
      `GET /api/openid-vc/requests/${txid}/kyc-complete - Error: JSON.stringify(error)`
    );
    return Response.json(
      { success: false, error },
      { status: 400, statusText: "bad_request" }
    );
  }
}
