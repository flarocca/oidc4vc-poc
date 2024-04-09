import { getKeyStore } from "@/app/helpers/token";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.error(`GET /oauth2/jwks - Initiated`);

    const keyStore = (await getKeyStore()) as any;

    console.error(`GET /oauth2/jwks - Complete`);

    return Response.json(keyStore.toJSON());
  } catch (error) {
    console.error(`GET /oauth2/jwks - Error: ${JSON.stringify(error)}`);
    return Response.json(
      { code: "internal_server_error", error: JSON.stringify(error) },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
