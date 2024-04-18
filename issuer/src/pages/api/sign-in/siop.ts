import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";

/*
Example:

Deep Link: openid://?request_uri=https%3A%2F%2Fssi.dutchblockchaincoalition.org%2Fagent%2Fsiop%2Fdefinitions%2Fdbc2023%2Fauth-requests%2F98c4a138-6b13-4ac4-9bba-55dc6107f4b5
*/

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  await dbConnect();

  console.log(`POST /api/sign-in/siop - Initiated`);

  try {
    const body: {
      code: string;
      state: string;
      nonce: string;
    } = req.body;

    const openidVcFlow = await AuthenticationFlowDocument.findOne({
      type: "siop",
      code: body.code,
    }).exec();

    console.log(`POST /api/sign-in/siop - Found. ${body.code}`);

    const authFlow = await AuthenticationFlowDocument.create({
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

    const requestUri = `openid://?request_uri=${request_uri_encoded}`;

    console.log(`POST /api/sign-in/siop - Completed`);

    res.status(200).json({
      code: authFlow.code,
      state: body.state,
      requestUri,
    });
  } catch (error) {
    console.error(`POST /api/sign-in/siop - Error: ${JSON.stringify(error)}`);

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
