import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";

type Params = {
  txid: string;
};

export async function GET(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(`GET /api/siop/status/${txid} - Querying`);

  try {
    const auth_flow = await AuthenticationFlow.findOne({
      type: "siop",
      code: txid,
    });

    if (auth_flow) {
      console.log(
        `GET /api/siop/status/${txid} - Found. Status is ${auth_flow.status}`
      );
      return Response.json({
        success: true,
        data: { status: auth_flow.status },
      });
    }

    console.log(`GET /api/siop/status/${txid} - Not Found`);
    return Response.json(
      { success: false, error: { message: `Request ${txid} not found.` } },
      { status: 404, statusText: "not_found" }
    );
  } catch (error) {
    console.error(
      `GET /api/siop/status/${txid} - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "internal_server_erorr" }
    );
  }
}
