import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  console.log(
    `/api/oauth2/authorize/oidc - Initiating OIDC Authorization Code Flow`
  );

  const body: { state: string; nonce: string; redirect_uri: string } =
    await req.json();

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "oidc",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      redirectUri: body.redirect_uri,
    });

    console.log(
      `/api/oauth2/authorize/oidc - Authorization flow created. Code: ${auth_flow.code}`
    );

    return Response.json({ success: true, data: auth_flow });
  } catch (error) {
    console.error(
      `/api/oauth2/authorize/oidc - Authorization flow failed. Error: ${JSON.stringify(
        error
      )}`
    );
    return Response.json(
      { success: false, error },
      { status: 400, statusText: "bad_request" }
    );
  }
}