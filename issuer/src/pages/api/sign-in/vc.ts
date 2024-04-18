import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";

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

  console.log(`POST /api/sign-in/vc - Initiated`);

  try {
    const body: {
      code: string;
      state: string;
      nonce: string;
      requireEmailVerified: boolean;
      requireKyc: boolean;
      requirePii: boolean;
    } = req.body;

    const openidVcFlow = await AuthenticationFlowDocument.findOne({
      type: "openid-vc",
      code: body.code,
    }).exec();

    console.log(`POST /api/sign-in/vc - Found. ${body.code}`);

    const authFlow = await AuthenticationFlowDocument.create({
      type: "openid-vc",
      code: uuidv4(),
      state: uuidv4(),
      nonce: uuidv4(),
      status: "initiated",
      redirectUri: openidVcFlow.redirectUri,
      data: {
        requireEmailVerified: body.requireEmailVerified,
        requireKyc: body.requireKyc,
        requirePii: body.requirePii,
      },
    });

    console.log(`POST /api/sign-in/vc - Created. ${authFlow.code}`);

    const request_uri_encoded = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}/openid-vc/requests/${
        authFlow.code
      }`
    );

    const requestUri = `openid-vc://?request_uri=${request_uri_encoded}`;

    console.log(`POST /api/sign-in/vc - Completed`);

    res.status(200).json({
      success: true,
      code: authFlow.code,
      state: body.state,
      requestUri,
    });
  } catch (error) {
    console.error(`POST /api/sign-in/vc - Error: ${JSON.stringify(error)}`);

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
