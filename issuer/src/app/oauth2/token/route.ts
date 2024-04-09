import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getKeyStore } from "../../helpers/token";
import jose from "node-jose";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";

const create_token = async (payload: any) => {
  const keyStore = await getKeyStore();
  const [key] = keyStore.all({ use: "sig", kty: "RSA" });

  const opt = { compact: true, fields: { typ: "JWT" } };

  return await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(payload))
    .final();
};

const authorization_code_handler = async (data: FormData) => {
  console.log(`POST /oauth2/token - Handling Authorization Code`);

  const code = data.get("code");

  const auth_flow = await AuthenticationFlow.findOneAndDelete({
    code: code,
    type: "oidc",
  }).exec();

  if (!auth_flow) {
    console.log(`POST /oauth2/token - Not Found. ${code}`);

    return Response.json(
      { error: "bad_request" },
      { status: 400, statusText: "bad_request" }
    );
  }
  console.log(`POST /oauth2/token - Found. ${code}`);

  const dt = new Date();
  const payload = {
    sub: uuidv4(),
    iss: `${process.env.EXTERNAL_SERVER_URI as string}`,
    iat: Math.floor(dt.getTime() / 1000),
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    nonce: auth_flow.nonce,
    ...auth_flow.data,
  };

  const token = await create_token(payload);

  console.log(`POST /oauth2/token - Complete. ${code}`);

  return Response.json({
    access_token: token,
    id_token: token,
    token_type: "bearer",
    expires_in: 300,
  });
};

const pre_authorization_code_handler = async (data: FormData) => {
  console.log(`POST /oauth2/token - Handling Pre-Authorization Code`);

  const preAuthorizedCode = data.get("pre-authorized_code");

  const auth_flow = await AuthenticationFlow.findOneAndDelete({
    code: preAuthorizedCode,
    type: "pre-authorized_code",
  }).exec();

  if (!auth_flow) {
    console.log(`POST /oauth2/token - Not Found. ${preAuthorizedCode}`);
    return Response.json(
      { error: "bad_request" },
      { status: 400, statusText: "bad_request" }
    );
  }

  console.log(`POST /oauth2/token - Found. ${preAuthorizedCode}`);

  const dt = new Date();
  const payload = {
    iat: Math.floor(dt.getTime() / 1000),
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    iss: `${process.env.EXTERNAL_SERVER_URI as string}`,
    preAuthorizedCode,
  };

  const token = await create_token(payload);

  console.log(`POST /oauth2/token - Complete. ${preAuthorizedCode}`);

  return Response.json({
    access_token: token,
    token_type: "bearer",
    expires_in: 300,
    c_nonce: "447ff6da-917c-40c2-a68a-e4c17affd2a6",
    c_nonce_expires_in: 300000,
    authorization_pending: false,
    interval: 300000,
  });
};

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    console.log(`POST /oauth2/token - Initiated`);

    const data = await req.formData();
    const grant_type = data.get("grant_type");

    switch (grant_type) {
      case "authorization_code":
        return await authorization_code_handler(data);
      case "urn:ietf:params:oauth:grant-type:pre-authorized_code":
        return await pre_authorization_code_handler(data);
      default:
        console.log(`POST /oauth2/token - Error: Invalid grant`);
        return Response.json(
          {
            error: "invalid_grant",
            error_description: "unsupported grant_type",
          },
          { status: 400, statusText: "bad_request" }
        );
    }
  } catch (error) {
    console.error(`POST /oauth2/token - Error: ${JSON.stringify(error)}`);
    return Response.json(
      { code: "internal_server_error", error: JSON.stringify(error) },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
