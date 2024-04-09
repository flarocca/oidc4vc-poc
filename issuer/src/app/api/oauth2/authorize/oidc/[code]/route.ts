import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

type Params = {
  code: string;
};

export async function GET(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { code } = context.params;

  console.log(`GET /api/oauth2/authorize/oidc/${code} - Getting`);

  try {
    const auth_flow = await AuthenticationFlow.findOne({
      type: "oidc",
      code,
    });

    console.log(`GET /api/oauth2/authorize/oidc/${code} - Found`);

    return Response.json({
      success: true,
      data: { code: auth_flow.code, redirectUri: auth_flow.redirectUri },
    });
  } catch (error) {
    console.error(
      `GET /api/oauth2/authorize/oidc/${code} - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false, error },
      { status: 400, statusText: "bad_request" }
    );
  }
}
