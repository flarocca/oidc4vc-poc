import { v4 as uuidv4 } from "uuid";

export default function createVpPayload(options: {
  did: string;
  txid: string;
  nonce: string;
  state: string;
  requirePii: boolean;
  requireEmailVerified: boolean;
  requireKyc: boolean;
}) {
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

  if (options.requirePii) {
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
    client_id: options.did,
    iss: options.did,
    sub: options.did,
    redirect_uri: `${
      process.env.EXTERNAL_SERVER_URI as string
    }/api/openid-vc/responses/${options.txid}/sign-in`,
    nonce: options.nonce,
    state: options.state,
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
}
