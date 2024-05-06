import { jwtDecode } from "jwt-decode";
import { Jwt, PresentationExchange } from "@web5/credentials";
import { v4 as uuidv4 } from "uuid";
import { getIssuer } from "./issuer";

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

const createPresentationDefinition = (options: {
  requirePii: boolean;
  requireEmailVerified: boolean;
  requireKyc: boolean;
}) => {
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

  const inputDescriptors = [
    {
      id: options.requirePii ? "must-include-pii-and-email" : "only-email",
      name: options.requirePii
        ? "Must include PII & Email"
        : "Must include only email",
      purpose: options.requirePii
        ? "Authenticate you using PII data & email"
        : "Authenticate you using using only email",
      constraints: {
        fields,
      },
    },
  ];

  const presentationDefinition = {
    id: "authn-with-vc",
    purpose: "Authentication using VCs",
    input_descriptors: inputDescriptors,
  };

  PresentationExchange.validateDefinition({
    presentationDefinition,
  });

  return presentationDefinition;
};

export function extractClaimsFromVpToken(vpToken: string): any {
  const payload: {
    vp: { verifiableCredential: string[] };
  } = jwtDecode(vpToken);

  return extractClaims(payload.vp.verifiableCredential);
}

export async function createSignedPresentationDefinition(options: {
  redirectUri: string;
  nonce: string;
  state: string;
  requirePii: boolean;
  requireEmailVerified: boolean;
  requireKyc: boolean;
}): Promise<string> {
  const presentationDefinition = createPresentationDefinition(options);
  const issuer = await getIssuer();

  const dt = new Date();
  const payload = {
    iat: Math.floor(dt.getTime() / 1000),
    nbf: Math.floor(dt.getTime() / 1000),
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    jti: uuidv4(),
    response_mode: "post",
    response_type: "vp_token",
    scope: "openid",
    client_id: issuer.uri,
    iss: issuer.uri,
    sub: issuer.uri,
    redirect_uri: options.redirectUri,
    nonce: options.nonce,
    state: options.state,
    registration: {
      id_token_signing_alg_values_supported: ["RS256"],
      request_object_signing_alg_values_supported: ["ES256"],
      response_types_supported: ["code", "id_token", "vp_token"],
      scopes_supported: ["openid", "email", "profile" /*, "did_authn"*/],
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
    claims: {
      vp_token: {
        presentation_definition: presentationDefinition,
      },
    },
  };

  return await Jwt.sign({
    signerDid: issuer,
    payload,
  });
}
