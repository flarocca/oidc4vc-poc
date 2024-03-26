import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  const body: { state: string; nonce: string } = await req.json();

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "openid-vc",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      status: "initiated",
    });

    const request_uri_encoded = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}/api/openid-vc/requests/v1/${
        auth_flow.code
      }`
    );

    const request_uri = `openid-vc://?request_uri=${request_uri_encoded}`;

    return Response.json({
      success: true,
      data: { ...auth_flow, request_uri },
    });
  } catch (error) {
    console.log(`Error: ${JSON.stringify(error)}`);
    return Response.json(
      { success: false },
      { status: 400, statusText: "bad_request" }
    );
  }
}
