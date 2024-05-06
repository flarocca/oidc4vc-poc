import { getIssuer } from "@/helpers/issuer";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { Jwt } from "@web5/credentials";
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

  console.log(`GET /api/siop/requests/${txid} - Initiated`);

  try {
    const authFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "siop",
        code: txid,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(`GET /api/siop/requests/${txid} - Found`);

    const issuer = await getIssuer();

    const dt = new Date();
    const payload = {
      iat: Math.floor(dt.getTime() / 1000),
      exp: Math.floor(
        (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
      ),
      response_type: "vp_token",
      scope: "openid",
      client_id: issuer.uri,
      response_uri: `${process.env.ISSUER as string}/siop/responses/${txid}`,
      response_mode: "direct_post",
      nonce: authFlow.nonce,
      state: authFlow.state,
      client_metadata: {
        id_token_signing_alg_values_supported: ["ES256"],
        request_object_signing_alg_values_supported: ["ES256"],
        response_types_supported: ["id_token", "vp_token"],
        scopes_supported: ["openid did_authn"],
        subject_types_supported: ["pairwise"],
        subject_syntax_types_supported: ["did:jwk"],
        vp_formats: {
          jwt_vc: {
            alg: ["ES256"],
          },
          jwt_vp: {
            alg: ["ES256"],
          },
        },
      },
      presentation_definition: {
        id: "authn-with-vc",
        purpose: "Authentication using VCs",
        format: {
          jwt_vc: {
            alg: ["ES256"],
          },
          jwt_vp: {
            alg: ["ES256"],
          },
        },
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
      nbf: Math.floor(dt.getTime() / 1000),
      jti: "f4c8373d-d5ae-4eef-bf43-8da13f6ff5dd",
      iss: issuer.uri,
      sub: issuer.uri,
    };

    const signegJwt = await Jwt.sign({
      signerDid: issuer,
      payload,
    });

    console.log(`GET /api/siop/requests/${txid} - Complete`);

    res.status(200).end(signegJwt);
  } catch (error) {
    console.error(
      `GET /api/siop/requests/${txid} - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
