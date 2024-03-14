import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return Response.json({
    issuer: "http://localhost:3000/api",
    authorization_endpoint: "http://localhost:3000/oauth2/authorize",
    token_endpoint: "http://localhost:3000/api/oauth2/token",
    userinfo_endpoint: "http://localhost:3000/api/oauth2/userinfo",
    jwks_uri: "http://localhost:3000/api/oauth2/jwks",
    scopes_supported: ["openid", "email", "profile"],
    response_types_supported: ["code id_token"],
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
