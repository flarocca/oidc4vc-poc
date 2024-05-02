import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  console.log(`POST /api/oauth2/authorize/siop - Initiated`);

  const body: { state: string; nonce: string; redirectUri: string } =
    await req.json();

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "siop",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      status: "initiated",
      redirectUri: body.redirectUri,
    });

    console.log(
      `POST /api/oauth2/authorize/siop - Complete. ${auth_flow.code}`
    );

    return Response.json({
      success: true,
      data: { code: auth_flow.code },
    });
  } catch (error) {
    console.log(
      `POST /api/oauth2/authorize/siop - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "inernal_server_error" }
    );
  }
}