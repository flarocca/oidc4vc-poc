import { getKeyStore } from "@/helpers/token";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import jose from "node-jose";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";
import { getIssuer } from "@/helpers/issuer";

const createToken = async (payload: any) => {
  const keyStore = await getKeyStore();
  const [key] = keyStore.all({ use: "sig", kty: "RSA" });

  const opt = { compact: true, fields: { typ: "JWT" } };

  return await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(payload))
    .final();
};

const handleAuthorizationCode = async (code: string) => {
  console.log(`POST /api/oauth2/token - Handling Authorization Code`);

  const auth_flow = await AuthenticationFlowDocument.findOneAndDelete({
    code: code,
    type: "oidc",
  }).exec();

  if (!auth_flow) {
    console.log(`POST /api/oauth2/token - Not Found. ${code}`);

    return {
      status: 400,
      statusText: "bad_request",
      result: {
        error: "invalid_code",
        errorDescription: "invalid_code",
      },
    };
  }

  console.log(`POST /oauth2/token - Found. ${code}`);

  const dt = new Date();
  const payload = {
    sub: uuidv4(),
    iss: `${process.env.ISSUER as string}`,
    iat: Math.floor(dt.getTime() / 1000),
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    nonce: auth_flow.nonce,
    ...auth_flow.data,
  };

  const token = await createToken(payload);

  console.log(`POST /api/oauth2/token - Complete. ${code}`);

  return {
    status: 200,
    result: {
      access_token: token,
      id_token: token,
      token_type: "bearer",
      expires_in: 300,
    },
  };
};

const handlePreAuthorizationCode = async (preAuthorizedCode: string) => {
  console.log(`POST /api/oauth2/token - Handling Pre-Authorization Code`);

  const auth_flow = await AuthenticationFlowDocument.findOneAndDelete({
    code: preAuthorizedCode,
    type: "pre-authorized_code",
  }).exec();

  if (!auth_flow) {
    console.log(`POST /api/oauth2/token - Not Found. ${preAuthorizedCode}`);

    return {
      status: 400,
      statusText: "bad_request",
      result: {
        error: "invalid_code",
        errorDescription: "invalid_code",
      },
    };
  }

  console.log(`POST /api/oauth2/token - Found. ${preAuthorizedCode}`);

  const dt = new Date();
  const payload = {
    iat: Math.floor(dt.getTime() / 1000),
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    iss: `${process.env.ISSUER as string}`,
    preAuthorizedCode,
  };

  const token = await createToken(payload);

  console.log(`POST /api/oauth2/token - Complete. ${preAuthorizedCode}`);

  return {
    status: 200,
    result: {
      access_token: token,
      token_type: "bearer",
      expires_in: 300,
      c_nonce: "447ff6da-917c-40c2-a68a-e4c17affd2a6",
      c_nonce_expires_in: 300000,
      authorization_pending: false,
      interval: 300000,
    },
  };
};

const handleToken = async (grantType: string = "", code: string) => {
  switch (grantType) {
    case "authorization_code":
      return await handleAuthorizationCode(code);
    case "urn:ietf:params:oauth:grant-type:pre-authorized_code":
      return await handlePreAuthorizationCode(code);
    default:
      console.log(`POST /api/oauth2/token - Error: Invalid grant`);

      return {
        status: 400,
        statusText: "bad_request",
        result: {
          error: "invalid_grant",
          errorDescription: "unsupported_grant_type",
        },
      };
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  await dbConnect();

  console.log(`POST /api/oauth2/token - Initiated`);

  try {
    console.log(`POST /api/oauth2/token - Body: ${req.body}`);
    const body: { grant_type: string; code: string } = req.body;
    const grantType = body.grant_type;
    const code = body.code;

    const result = await handleToken(grantType, code);

    res.statusCode = result.status;
    res.statusMessage = result.statusText || "";

    res.status(result.status).json(result.result);
  } catch (error) {
    console.error(`POST /api/oauth2/token - Error: ${JSON.stringify(error)}`);

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
