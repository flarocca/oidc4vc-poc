import dbConnect from "@/lib/dbConnect";
import { NextApiRequest } from "next";
import CredentialOfferDocument from "@/models/credential_offer";

type Params = {
  txid: string;
};

export async function GET(req: NextApiRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(`GET /api/credential-offer/requests/${txid} - Initiated`);

  try {
    const offer = await CredentialOfferDocument.findOneAndUpdate(
      {
        code: txid,
      },
      {
        status: "scanned",
      }
    );

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

    return Response.json(payload);
  } catch (error) {
    console.log(
      `GET /api/credential-offer/requests/${txid} - Error: ${JSON.stringify(
        error
      )}`
    );
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
