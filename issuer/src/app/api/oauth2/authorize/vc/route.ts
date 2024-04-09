import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  console.log(`POST /api/oauth2/authorize/vc - Initiated`);

  const body: { state: string; nonce: string; redirectUri: string } =
    await req.json();

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "openid-vc",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      status: "initiated",
      redirectUri: body.redirectUri,
    });

    console.log(`POST /api/oauth2/authorize/vc - Created. ${auth_flow.code}`);

    const request_uri_encoded = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}/api/openid-vc/requests/${
        auth_flow.code
      }`
    );

    const request_uri = `openid-vc://?request_uri=${request_uri_encoded}`;

    console.log(`POST /api/oauth2/authorize/vc - Complete`);

    return Response.json({
      success: true,
      data: { code: auth_flow.code, request_uri },
    });
  } catch (error) {
    console.log(
      `POST /api/oauth2/authorize/vc - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false },
      { status: 400, statusText: "bad_request" }
    );
  }
}
