import { NextRequest } from "next/server";
import AuthenticationFlow from "@/models/authentication_flow";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    console.log(`/api/sign-in/vc - Initiated`);

    const body: {
      code: string;
      state: string;
      nonce: string;
      requireEmailVerified: boolean;
      requireKyc: boolean;
      requirePii: boolean;
    } = await req.json();

    const auth_flow = await AuthenticationFlow.create({
      type: "openid-vc",
      code: uuidv4(),
      state: uuidv4(),
      nonce: uuidv4(),
      status: "initiated",
      data: {
        requireEmailVerified: body.requireEmailVerified,
        requireKyc: body.requireKyc,
        requirePii: body.requirePii,
      },
    });

    console.log(
      `/api/sign-in/vc - VC Authentication flow initiated. Code ${body.code}`
    );

    const request_uri_encoded = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}/api/openid-vc/requests/${
        auth_flow.code
      }`
    );

    const request_uri = `openid-vc://?request_uri=${request_uri_encoded}`;

    console.log(`/api/sign-in/vc - VC Authentication flow Completed`);

    return Response.json({
      success: true,
      code: auth_flow.code,
      state: body.state,
      request_uri,
    });
  } catch (error) {
    console.error(
      `/api/sign-in/vc - VC Authentication flow Failed. Error: ${JSON.stringify(
        error
      )}`
    );
    return Response.json(
      { code: "internal_server_error", error: JSON.stringify(error) },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
