import dbConnect from "@/lib/dbConnect";
import CredentialOfferDocument from "@/models/credentialOffer";
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

  console.log(`GET /api/credential-offer/requests/${txid} - Initiated`);

  try {
    const offer = await CredentialOfferDocument.findOneAndUpdate(
      {
        code: txid,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(`GET /api/credential-offer/requests/${txid} - Found`);

    const payload = {
      grants: {
        "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
          "pre-authorized_code": offer.code,
          user_pin_required: false,
        },
      },
      credentials: [offer.type],
      credential_issuer: process.env.ISSUER as string,
    };

    console.log(`GET /api/credential-offer/requests/${txid} - Complete`);

    res.status(200).json(payload);
  } catch (error) {
    console.log(
      `GET /api/credential-offer/requests/${txid} - Error: ${JSON.stringify(
        error
      )}`
    );
    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
