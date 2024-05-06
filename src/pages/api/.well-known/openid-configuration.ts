import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  console.log(`[OIDC Metadata]  GET /.well-known/openid-configuration`);

  res.status(200).json({
    issuer: `${process.env.ISSUER as string}`,
    authorization_endpoint: `${process.env.ISSUER as string}/oauth2/authorize`,
    token_endpoint: `${process.env.ISSUER as string}/oauth2/token`,
    userinfo_endpoint: `${process.env.ISSUER as string}/oauth2/userinfo`,
    jwks_uri: `${process.env.ISSUER as string}/oauth2/jwks`,
    credential_issuer_uri: `${
      process.env.ISSUER as string
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
