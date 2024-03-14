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
      type: "siop",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
    });

    const response_type = "response_type=id_token";
    const scope = "scope=openid%20profile%20email";
    const client_id =
      "client_id=http%3A%2F%2F192.168.0.114%3A3000%2Fapi%2Foauth2%2Fcallback%2Fsiop";
    const redirect_uri =
      "redirect_uri=http%3A%2F%2F192.168.0.114%3A3000%2Fapi%2Foauth2%2Fcallback%2Fsiop";
    const response_mode = "response_mode=post";
    const nonce = `nonce=${body.nonce}`;
    const state = `state=${body.state}`;

    const siop_uri = `openid://?${response_type}&${scope}&${client_id}&${redirect_uri}&${response_mode}&${nonce}&${state}`;

    console.log(JSON.stringify(`AuthenticationFlow: ${auth_flow}`));
    console.log(JSON.stringify(`SIOP URI: ${siop_uri}`));

    return Response.json({ success: true, data: { ...auth_flow, siop_uri } });
  } catch (error) {
    console.log(JSON.stringify(error));
    return Response.json(
      { success: false },
      { status: 400, statusText: "bad_request" }
    );
  }
}
