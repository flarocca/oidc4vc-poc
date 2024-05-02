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

  console.log(`GET /api/siop/status/${txid} - Querying`);

  try {
    const authFlow = await AuthenticationFlowDocument.findOne({
      type: "siop",
      code: txid,
    }).exec();

    if (authFlow) {
      console.log(
        `GET /api/siop/status/${txid} - Found. Status is ${authFlow.status}`
      );

      res.status(200).json({ status: authFlow.status });
      return;
    }

    console.log(`GET /api/siop/status/${txid} - Not Found`);

    res.statusCode = 404;
    res.statusMessage = "not_found";

    res.status(404).json({ error: "not_found" });
  } catch (error) {
    console.error(
      `GET /api/siop/status/${txid} - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
