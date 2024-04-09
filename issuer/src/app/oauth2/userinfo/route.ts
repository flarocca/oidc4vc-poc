import { NextRequest } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import jwktopem from "jwk-to-pem";
import { getKeyStore } from "../../helpers/token";

export async function GET(req: NextRequest) {
  console.error(`GET /oauth2/userinfo - Initiated`);

  const token = headers().get("authorization")?.split(" ")[1];

  if (!token) {
    console.error(`GET /oauth2/userinfo - Error: Unauthorized`);
    return Response.json({}, { status: 401, statusText: "unauthorized" });
  }

  try {
    console.error(`GET /oauth2/userinfo - Validating JWT`);

    const keyStore = await getKeyStore();
    const keys = (keyStore.toJSON() as any).keys;

    const [key] = keys.filter(
      (k: { use: string; kty: string }) => k.use === "sig" && k.kty === "RSA"
    );

    const publicKey = jwktopem(key);
    const claims = jwt.verify(token, publicKey);

    console.error(`GET /oauth2/userinfo - Token validated.`);

    return Response.json(claims);
  } catch (error) {
    console.error(`GET /oauth2/userinfo - Error: ${JSON.stringify(error)}`);
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
