import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return Response.json({
    issuer: `${process.env.EXTERNAL_SERVER_URI as string}`,
    authorization_endpoint: `${
      process.env.EXTERNAL_SERVER_URI as string
    }/oauth2/authorize`,
    token_endpoint: `${process.env.EXTERNAL_SERVER_URI as string}/oauth2/token`,
    userinfo_endpoint: `${
      process.env.EXTERNAL_SERVER_URI as string
    }/oauth2/userinfo`,
    jwks_uri: `${process.env.EXTERNAL_SERVER_URI as string}/oauth2/jwks`,
    credential_issuer_uri: `${
      process.env.EXTERNAL_SERVER_URI as string
    }/.well-known/openid-credential-issuer`,
    scopes_supported: ["openid", "email", "profile"],
    response_types_supported: ["code id_token vp_token"],
    subject_types_supported: ["pairwise"],
    id_token_signing_alg_values_supported: ["RS256"],
    claims_supported: [
      "sub",
      "exp",
      "iat",
      "iss",
      "email",
      "given_name",
      "family_name",
    ],
  });
}
