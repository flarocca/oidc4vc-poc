import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

type Params = {
  txid: string;
};

export async function GET(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(`/api/openid-vc/status/${txid} - Querying status`);

  try {
    const auth_flow = await AuthenticationFlow.findOne({
      type: "openid-vc",
      code: txid,
    });

    if (auth_flow) {
      console.log(
        `/api/openid-vc/status/${txid} - Status requested. Status: ${auth_flow.status}`
      );

      return Response.json(
        {
          success: true,
          status: auth_flow.status,
        },
        {
          status: 200,
        }
      );
    }

    console.error(`/api/openid-vc/status/${txid} - Not Found`);
    return Response.json(
      {
        success: false,
      },
      {
        status: 404,
      }
    );
  } catch (error) {
    console.log(JSON.stringify(error));
    return Response.json(
      { success: false, error },
      { status: 400, statusText: "bad_request" }
    );
  }
}
