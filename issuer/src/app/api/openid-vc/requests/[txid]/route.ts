import dbConnect from "@/lib/dbConnect";
import { NextApiRequest } from "next";
import AuthenticationFlow from "@/models/authentication_flow";
import jose from "node-jose";
import { getKeyStore } from "@/app/helpers/token";
import { v4 as uuidv4 } from "uuid";

type Params = {
  txid: string;
};

const createPayload = (
  did: string,
  txid: string,
  nonce: string,
  state: string,
  requirePii: boolean,
  requireEmailVerified: boolean,
  requireKyc: boolean
) => {
  const fields = [
    {
      path: [
        "$.credentialSubject.email",
        "$.vc.credentialSubject.email",
        "$.credentialSubject.emailAddress",
        "$.vc.credentialSubject.emailAddress",
      ],
    },
  ];

  if (requirePii) {
    fields.push({
      path: [
        "$.credentialSubject.firstName",
        "$.vc.credentialSubject.firstName",
        "$.credentialSubject.firstname",
        "$.vc.credentialSubject.firstname",
        "$.credentialSubject.first_name",
        "$.vc.credentialSubject.first_name",
        "$.credentialSubject.givenName",
        "$.vc.credentialSubject.givenName",
        "$.credentialSubject.givenname",
        "$.vc.credentialSubject.givenname",
        "$.credentialSubject.given_name",
        "$.vc.credentialSubject.given_name",
      ],
    });

    fields.push({
      path: [
        "$.credentialSubject.lastName",
        "$.vc.credentialSubject.lastName",
        "$.credentialSubject.lastname",
        "$.vc.credentialSubject.lastname",
        "$.credentialSubject.last_name",
        "$.vc.credentialSubject.last_name",
        "$.credentialSubject.familyName",
        "$.vc.credentialSubject.familyName",
        "$.credentialSubject.familyname",
        "$.vc.credentialSubject.familyname",
        "$.credentialSubject.family_name",
        "$.vc.credentialSubject.family_name",
      ],
    });
  }

  const input_descriptors = [
    {
      id: "basic-information",
      name: "Basic Information",
      purpose: "Authenticate you using basic information",
      constraints: {
        fields,
      },
    },
  ];

  const dt = new Date();
  const payload = {
    iat: Math.floor(dt.getTime() / 1000),
    nbf: Math.floor(dt.getTime() / 1000),
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    jti: uuidv4(),
    response_mode: "post",
    response_type: "id_token",
    scope: "openid",
    client_id: did,
    iss: did,
    sub: did,
    redirect_uri: `${
      process.env.EXTERNAL_SERVER_URI as string
    }/api/openid-vc/responses/${txid}/sign-in`,
    nonce,
    state,
    registration: {
      id_token_signing_alg_values_supported: ["EdDSA", "ES256", "ES256K"],
      request_object_signing_alg_values_supported: ["EdDSA", "ES256", "ES256K"],
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
    claims: {
      vp_token: {
        presentation_definition: {
          id: "authn-with-vc",
          purpose: "Authentication using VCs",
          input_descriptors,
        },
      },
    },
  };

  return payload;
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

    const payload = createPayload(
      did,
      txid,
      auth_flow.nonce,
      auth_flow.state,
      auth_flow.data.requirePii,
      auth_flow.data.requireEmailVerified,
      auth_flow.data.requireKyc
    );

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
