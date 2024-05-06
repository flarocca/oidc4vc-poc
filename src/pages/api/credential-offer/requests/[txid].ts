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

  console.log(
    `[OIDC Operational] GET /api/credential-offer/requests/${txid} - Initiated`
  );

  try {
    const offer = await CredentialOfferDocument.findOneAndUpdate(
      {
        code: txid,
      },
      {
        status: "scanned",
      }
    ).exec();

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

    console.log(
      `[OIDC Operational] GET /api/credential-offer/requests/${txid} - Complete ${JSON.stringify(
        payload,
        null,
        4
      )}`
    );

    res.status(200).json(payload);
  } catch (error) {
    console.log(
      `[OIDC Operational] GET /api/credential-offer/requests/${txid} - Error: ${JSON.stringify(
        error
      )}`
    );
    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}

/*
Response
  {
    "grants": {
        "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
            "pre-authorized_code": "8b6ee545-c78f-4d1c-b1f9-775d91a3bcbd",
            "user_pin_required": false
        }
    },
    "credentials": [
        "EmailVerifiedCredential"
    ],
    "credential_issuer": "https://oidc-poc.sandbox.accounts.forte.io/api"
}
*/
