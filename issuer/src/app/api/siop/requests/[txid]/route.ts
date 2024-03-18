import dbConnect from "@/lib/dbConnect";
import { NextApiRequest } from "next";
import AuthenticationFlow from "@/models/authentication_flow";
import jose from "node-jose";
import { getKeyStore } from "@/app/helpers/token";
import { JsonWebTokenError } from "jsonwebtoken";

type Params = {
  txid: string;
};

export async function GET(req: NextApiRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(`REQUEST TX ID: ${txid}`);

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
      response_type: "vp_token",
      scope: "openid",
      response_uri: `${
        process.env.EXTERNAL_SERVER_URI as string
      }/api/siop/responses/${txid}`,
      response_mode: "post",
      nonce: auth_flow.nonce,
      state: auth_flow.state,
      iss: did,
      sub: did,
      client_id: did,
      // client_metadata: {
      //   id_token_signing_alg_values_supported: ["RS256", "ES256"],
      //   request_object_signing_alg_values_supported: ["ES256"],
      //   response_types_supported: ["id_token"],
      //   scopes_supported: ["openid", "email", "profile"],
      //   subject_types_supported: ["pairwise"],
      //   vp_formats: {
      //     jwt_vp: {
      //       alg: ["ES256"],
      //     },
      //   },
      //   subject_syntax_types_supported: ["did:jwk"],
      // },
      // presentation_definition: {
      //   id: "demo-poc",
      //   purpose: "Just another demo",
      //   input_descriptors: [
      //     {
      //       id: "123-abc",
      //       name: "Descriptor 1",
      //       purpose: "Will see",
      //       constraints: {
      //         fields: [
      //           {
      //             path: [
      //               "$.credentialSubject.given_name",
      //               "$.vc.credentialSubject.given_name",
      //             ],
      //           },
      //           {
      //             path: [
      //               "$.credentialSubject.family_name",
      //               "$.vc.credentialSubject.family_name",
      //             ],
      //           },
      //         ],
      //       },
      //     },
      //   ],
      // },
      // claims: {
      userinfo: {
        verifiable_presentations: [
          {
            presentation_definition: {
              input_descriptors: [
                {
                  schema: [
                    {
                      uri: "https://did.itsourweb.org:3000/smartcredential/Ontario-Health-Insurance-Plan",
                    },
                  ],
                },
              ],
            },
          },
        ],
      },
      id_token: {
        auth_time: {
          essential: false,
        },
      },
      // },
    };

    const opt = { compact: true, protect: "*", fields: { typ: "JWT" } };

    const token = await jose.JWS.createSign(opt, key)
      .update(JSON.stringify(payload))
      .final();

    // create vc presentation JWT

    return new Response(token as unknown as string, {
      status: 200,
    });
  } catch (error) {
    console.log(JSON.stringify(error));
    return Response.json(
      { success: false, error },
      { status: 400, statusText: "bad_request" }
    );
  }
}
