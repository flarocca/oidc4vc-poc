import { NextRequest } from "next/server";
import AuthenticationFlow from "@/models/authentication_flow";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    console.log(`POST /api/sign-in/vc - Initiated`);

    const body: {
      code: string;
      state: string;
      nonce: string;
      requireEmailVerified: boolean;
      requireKyc: boolean;
      requirePii: boolean;
    } = await req.json();

    const openidVcFlow = await AuthenticationFlow.findOne({
      type: "openid-vc",
      code: body.code,
    });

    console.log(`POST /api/sign-in/vc - Found. ${body.code}`);

    const authFlow = await AuthenticationFlow.create({
      type: "openid-vc",
      code: uuidv4(),
      state: uuidv4(),
      nonce: uuidv4(),
      status: "initiated",
      redirectUri: openidVcFlow.redirectUri,
      data: {
        requireEmailVerified: body.requireEmailVerified,
        requireKyc: body.requireKyc,
        requirePii: body.requirePii,
      },
    });

    console.log(`POST /api/sign-in/vc - Created. ${authFlow.code}`);

    const request_uri_encoded = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}/api/openid-vc/requests/${
        authFlow.code
      }`
    );

    const requestUri = `openid-vc://?request_uri=${request_uri_encoded}`;

    console.log(`POST /api/sign-in/vc - Completed`);

    return Response.json({
      success: true,
      code: authFlow.code,
      state: body.state,
      requestUri,
    });
  } catch (error) {
    console.error(`POST /api/sign-in/vc - Error: ${JSON.stringify(error)}`);
    return Response.json(
      { code: "internal_server_error", error: JSON.stringify(error) },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
