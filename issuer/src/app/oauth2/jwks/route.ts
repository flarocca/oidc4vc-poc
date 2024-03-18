import { getKeyStore } from "@/app/helpers/token";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const keyStore = (await getKeyStore()) as any;

  return Response.json(keyStore.toJSON());
}
