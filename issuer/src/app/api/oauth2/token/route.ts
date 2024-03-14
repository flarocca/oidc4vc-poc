import { NextRequest } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getKeyStore } from "../../helpers/token";
import jose from "node-jose";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";

export async function POST(req: NextRequest) {
  await dbConnect();

  const data = await req.formData();
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
    iss: "http://localhost:3000/api",
    iat: Math.floor(dt.getTime() / 1000),
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    nonce: auth_flow.nonce,
  };

  const keyStore = await getKeyStore();
  const [key] = keyStore.all({ use: "sig" });

  const opt = { compact: true, jwk: key, fields: { typ: "jwt" } };

  const token = await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(payload))
    .final();

  return Response.json({
    access_token: token,
    id_token: token,
    token_type: "bearer",
    expires_in: 300,
  });
}
