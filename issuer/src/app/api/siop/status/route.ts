import dbConnect from "@/lib/dbConnect";
import { NextApiRequest } from "next";
import AuthenticationFlow from "@/models/authentication_flow";

export async function POST(req: NextApiRequest) {
  await dbConnect();

  const { request } = req.query;

  try {
    const auth_flow = await AuthenticationFlow.findOne({
      type: "siop",
      code: request,
    });

    if (auth_flow) {
      return Response.json({
        success: true,
        data: { status: auth_flow.status },
      });
    }

    return Response.json(
      { success: false, error: { message: `Request ${request} not found.` } },
      { status: 404, statusText: "not_found" }
    );
  } catch (error) {
    console.log(JSON.stringify(error));
    return Response.json(
      { success: false },
      { status: 400, statusText: "bad_request" }
    );
  }
}
