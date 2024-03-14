import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  const body: { state: string; nonce: string } = await req.json();

  console.log(`Body: ${JSON.stringify(body)}`);

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "oidc",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
    });

    return Response.json({ success: true, data: auth_flow });
  } catch (error) {
    console.log(JSON.stringify(error));
    return Response.json(
      { success: false },
      { status: 400, statusText: "bad_request" }
    );
  }
}
