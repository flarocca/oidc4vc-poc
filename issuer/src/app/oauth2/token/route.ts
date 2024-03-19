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
  await dbConnect();

  const code = data.get("code");

  const auth_flow = await AuthenticationFlow.findOneAndDelete({
    code: code,
  }).exec();

  if (!auth_flow) {
    return Response.json(
      { error: "bad_request" },
      { status: 400, statusText: "bad_request" }
    );
  }

  const dt = new Date();
  const payload = {
    sub: uuidv4(),
    email: "facu.larocca@gmail.com",
    given_name: "Facundo",
    family_name: "La Rocca",
    iss: `${process.env.EXTERNAL_SERVER_URI as string}`,
    iat: Math.floor(dt.getTime() / 1000),
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    nonce: auth_flow.nonce,
  };

  // const keyStore = await getKeyStore();
  // const [key] = keyStore.all({ use: "sig", kty: "RSA" });

  // const opt = { compact: true, fields: { typ: "JWT" } };

  // const token = await jose.JWS.createSign(opt, key)
  //   .update(JSON.stringify(payload))
  //   .final();
  const token = await create_token(payload);

  return Response.json({
    access_token: token,
    id_token: token,
    token_type: "bearer",
    expires_in: 300,
  });
};

const pre_authorization_code_handler = async (data: FormData) => {
  await dbConnect();

  // const data = await req.formData();
  const preAuthorizedCode = data.get("pre-authorized_code");

  console.log(`preAuthorizedCode - ${preAuthorizedCode}`);

  const auth_flow = await AuthenticationFlow.findOneAndDelete({
    code: preAuthorizedCode,
    type: "pre-authorized_code",
  }).exec();

  console.log(`auth_flow - ${JSON.stringify(auth_flow)}`);

  if (!auth_flow) {
    return Response.json(
      { error: "bad_request" },
      { status: 400, statusText: "bad_request" }
    );
  }

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

  const data = await req.formData();
  const grant_type = data.get("grant_type");

  switch (grant_type) {
    case "authorization_code":
      return await authorization_code_handler(data);
    case "urn:ietf:params:oauth:grant-type:pre-authorized_code":
      return await pre_authorization_code_handler(data);
    default:
      return Response.json(
        { error: "invalid_grant", error_description: "unsupported grant_type" },
        { status: 400, statusText: "bad_request" }
      );
  }
}
