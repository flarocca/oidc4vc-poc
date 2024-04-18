import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  await dbConnect();

  const { txid } = req.query;

  console.log(`GET /api/openid-vc/status/${txid} - Initiated`);

  try {
    const auth_flow = await AuthenticationFlowDocument.findOne({
      type: "openid-vc",
      code: txid,
    }).exec();

    if (auth_flow) {
      console.log(
        `GET /api/openid-vc/status/${txid} - Found. Status is ${auth_flow.status}`
      );

      res.status(200).json({ status: auth_flow.status });
      return;
    }

    console.error(`GET /api/openid-vc/status/${txid} - Not Found`);

    res.statusCode = 404;
    res.statusMessage = "not_found";

    res.status(404).json({ error: "not_found" });
  } catch (error) {
    console.error(
      `GET /api/openid-vc/status/${txid} - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
