import { NextRequest } from "next/server";
import { getKeyStore } from "../../helpers/token";

export async function GET(req: NextRequest) {
  const keyStore = (await getKeyStore()) as any;

  return Response.json(keyStore.toJSON());
}
