import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  const body: { state: string; nonce: string } = await req.json();

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "siop",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      status: "initiated",
    });
    const request_uri = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}/api/siop/requests/v1/${
        auth_flow.code
      }`
    );
    // const client_id = encodeURIComponent(
    //   `${process.env.EXTERNAL_SERVER_URI as string}/api/siop/responses/v1/${
    //     auth_flow.code
    //   }`
    // );
    const client_id = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}`
    );

    const siop_uri = `openid://?request_uri=${request_uri}&client_id=${client_id}`;
    // const siop_uri = `openid://?request_uri=${request_uri}`;

    return Response.json({
      success: true,
      data: { ...auth_flow, siop_uri },
    });
  } catch (error) {
    console.log(`Error: ${JSON.stringify(error)}`);
    return Response.json(
      { success: false },
      { status: 400, statusText: "bad_request" }
    );
  }
}
