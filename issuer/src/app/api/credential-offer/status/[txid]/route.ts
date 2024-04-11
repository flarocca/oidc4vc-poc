import dbConnect from "@/lib/dbConnect";
import CredentialOfferDocument from "@/models/credential_offer";
import { NextRequest } from "next/server";

type Params = {
  txid: string;
};

export async function GET(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;

  console.log(`GET /api/credential-offer/status/${txid} - Querying`);

  try {
    const auth_flow = await CredentialOfferDocument.findOne({
      code: txid,
    });

    if (auth_flow) {
      console.log(
        `GET /api/credential-offer/status/${txid} - Found. Status is ${auth_flow.status}`
      );

      return Response.json(
        {
          success: true,
          status: auth_flow.status,
        },
        {
          status: 200,
        }
      );
    }

    console.error(`GET /api/credential-offer/status/${txid} - Not Found`);
    return Response.json(
      {
        success: false,
      },
      {
        status: 404,
      }
    );
  } catch (error) {
    console.error(
      `GET /api/credential-offer/status/${txid} - Error: ${JSON.stringify(
        error
      )}`
    );
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "internal_server_erorr" }
    );
  }
}
