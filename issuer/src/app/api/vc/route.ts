import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  await dbConnect();

  const body: { state: string; nonce: string } = await req.json();

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "pre-authorized_code",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      status: "initiated",
    });

    const credential_offer = {
      grants: {
        "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
          "pre-authorized_code": auth_flow.code,
          user_pin_required: false,
        },
      },
      credentials: ["MembershipExample"],
      credential_issuer: process.env.EXTERNAL_SERVER_URI as string,
    };

    const credential_offer_encoded = encodeURIComponent(
      JSON.stringify(credential_offer)
    );

    const credential_offer_uri = `openid-credential-offer://?credential_offer=${credential_offer_encoded}`;

    return Response.json({
      success: true,
      data: { ...auth_flow, credential_offer_uri },
    });
  } catch (error) {
    console.log(`Error: ${JSON.stringify(error)}`);
    return Response.json(
      { success: false },
      { status: 400, statusText: "bad_request" }
    );
  }
}
