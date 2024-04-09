import { NextApiRequest } from "next";

type Params = {
  txid: string;
};

export async function POST(req: NextApiRequest, context: { params: Params }) {
  const { txid } = context.params;

  console.error(`GET /api/siop/responses/${txid} - Initiated`);

  console.error(`GET /api/siop/responses/${txid} - Found`);

  console.error(`GET /api/siop/responses/${txid} - Complete`);

  try {
    return Response.json({ success: true });
  } catch (error) {
    console.error(
      `GET /api/siop/responses/${txid} - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "internal_server_erorr" }
    );
  }
}
