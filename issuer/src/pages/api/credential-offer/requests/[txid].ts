import dbConnect from "@/lib/dbConnect";
import CredentialOfferDocument from "@/models/credentialOffer";
import type { NextApiRequest, NextApiResponse } from "next";

/*
Example:

Deep link: openid-credential-offer://?credential_offer=%7B%22grants%22%3A%7B%22urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Apre-authorized_code%22%3A%7B%22pre-authorized_code%22%3A%22xhW1mBuqDAVwgeSZhEF5nn%22%2C%22user_pin_required%22%3Afalse%7D%7D%2C%22credentials%22%3A%5B%22fmdm2023%22%5D%2C%22credential_issuer%22%3A%22https%3A%2F%2Fssi.future-mobility-alliance.org%2Fissuer%22%7D
Payload 
{
  "grants": {
    "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
      "pre-authorized_code": "xhW1mBuqDAVwgeSZhEF5nn",
      "user_pin_required": false
    }
  },
  "credentials": [
    "fmdm2023"
  ],
  "credential_issuer": "https://ssi.future-mobility-alliance.org/issuer"
}
*/

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
      credential_issuer: process.env.EXTERNAL_SERVER_URI as string,
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
