import { getKeyStore } from "@/helpers/token";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import jose from "node-jose";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";

const createToken = async (payload: any) => {
  const keyStore = await getKeyStore();
  const [key] = keyStore.all({ use: "sig", kty: "RSA" });

  const opt = { compact: true, fields: { typ: "JWT" } };

  return await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(payload))
    .final();
};

const handleAuthorizationCode = async (code: string) => {
  console.info(
    `[OIDC Operational] POST /api/oauth2/token - Handling Authorization Code`
  );

  const auth_flow = await AuthenticationFlowDocument.findOneAndDelete({
    code: code,
    type: "oidc",
  }).exec();

  if (!auth_flow) {
    console.info(
      `[OIDC Operational] POST /api/oauth2/token - Not Found. ${code}`
    );

    return {
      status: 400,
      statusText: "bad_request",
      result: {
        error: "invalid_code",
        errorDescription: "invalid_code",
      },
    };
  }

  console.info(`[OIDC Operational] POST /oauth2/token - Found. ${code}`);

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

  console.info(`[OIDC Operational] POST /api/oauth2/token - Complete. ${code}`);

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
  console.info(
    `[OIDC Operational] POST /api/oauth2/token - Handling Pre-Authorization Code`
  );

  const auth_flow = await AuthenticationFlowDocument.findOneAndDelete({
    code: preAuthorizedCode,
    type: "pre-authorized_code",
  }).exec();

  if (!auth_flow) {
    console.info(
      `[OIDC Operational] POST /api/oauth2/token - Not Found. ${preAuthorizedCode}`
    );

    return {
      status: 400,
      statusText: "bad_request",
      result: {
        error: "invalid_code",
        errorDescription: "invalid_code",
      },
    };
  }

  console.info(
    `[OIDC Operational] POST /api/oauth2/token - Found. ${preAuthorizedCode}`
  );

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

  console.info(
    `[OIDC Operational] POST /api/oauth2/token - Complete. ${preAuthorizedCode}`
  );

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

const handleToken = async (body: {
  grant_type: string;
  code: string;
  "pre-authorized_code": string;
}) => {
  switch (body.grant_type) {
    case "authorization_code":
      return await handleAuthorizationCode(body.code);
    case "urn:ietf:params:oauth:grant-type:pre-authorized_code":
      return await handlePreAuthorizationCode(body["pre-authorized_code"]);
    default:
      console.info(`POST /api/oauth2/token - Error: Invalid grant`);

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

  console.info(`[OIDC Operational] POST /api/oauth2/token - Initiated`);

  try {
    const result = await handleToken(req.body);

    res.statusCode = result.status;
    res.statusMessage = result.statusText || "";

    res.status(result.status).json(result.result);
  } catch (error) {
    console.error(
      `[OIDC Operational] POST /api/oauth2/token - Error: ${JSON.stringify(
        error
      )}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
