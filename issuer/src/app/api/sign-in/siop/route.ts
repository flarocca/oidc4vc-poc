import { NextRequest } from "next/server";
import AuthenticationFlow from "@/models/authentication_flow";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import { getKeyStore } from "@/app/helpers/token";

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    console.log(`POST /api/sign-in/siop - Initiated`);

    const body: {
      code: string;
      state: string;
      nonce: string;
    } = await req.json();

    const openidVcFlow = await AuthenticationFlow.findOne({
      type: "siop",
      code: body.code,
    });

    console.log(`POST /api/sign-in/siop - Found. ${body.code}`);

    const authFlow = await AuthenticationFlow.create({
      type: "siop",
      code: uuidv4(),
      state: uuidv4(),
      nonce: uuidv4(),
      status: "initiated",
      redirectUri: openidVcFlow.redirectUri,
    });

    console.log(`POST /api/sign-in/siop - Created. ${authFlow.code}`);

    const request_uri_encoded = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}/api/siop/requests/${
        authFlow.code
      }`
    );

    const keyStore = await getKeyStore();
    const [key] = keyStore.all({ use: "sig", kty: "EC" });
    const did = `did:jwk:${Buffer.from(JSON.stringify(key.toJSON())).toString(
      "base64"
    )}`;

    const requestUri = `openid://?request_uri=${request_uri_encoded}`;

    console.log(`POST /api/sign-in/siop - Completed`);

    return Response.json({
      success: true,
      code: authFlow.code,
      state: body.state,
      requestUri,
    });
  } catch (error) {
    console.error(`POST /api/sign-in/siop - Error: ${JSON.stringify(error)}`);

    return Response.json(
      { code: "internal_server_error", error: JSON.stringify(error) },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
