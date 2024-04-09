import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  console.log(`POST /api/oauth2/authorize/oidc - Initiating`);

  const body: { state: string; nonce: string; redirectUri: string } =
    await req.json();

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "oidc",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      redirectUri: body.redirectUri,
    });

    console.log(`POST /api/oauth2/authorize/oidc - Created. ${auth_flow.code}`);

    return Response.json({ success: true, data: auth_flow });
  } catch (error) {
    console.error(
      `POST /api/oauth2/authorize/oidc - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false, error },
      { status: 400, statusText: "bad_request" }
    );
  }
}
