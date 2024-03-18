import { NextRequest } from "next/server";
import { headers } from "next/headers";
import jwt from "jsonwebtoken";
import jwktopem from "jwk-to-pem";
import { getKeyStore } from "../../helpers/token";

export async function GET(req: NextRequest) {
  const token = headers().get("authorization")?.split(" ")[1];

  if (!token) {
    return Response.json({}, { status: 401, statusText: "unauthorized" });
  }

  try {
    const keyStore = await getKeyStore();
    const keys = (keyStore.toJSON() as any).keys;

    const [key] = keys.filter(
      (k: { use: string; kty: string }) => k.use === "sig" && k.kty === "RSA"
    );

    const publicKey = jwktopem(key);
    const claims = jwt.verify(token, publicKey);

    return Response.json(claims);
  } catch (error) {
    return Response.json(
      { code: "invalid_token", error },
      { status: 401, statusText: "unauthorized" }
    );
  }
}
