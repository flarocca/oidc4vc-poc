import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return Response.json(
    { error: "internal_server_error" },
    { status: 500, statusText: "internal_server_error" }
  );
}
