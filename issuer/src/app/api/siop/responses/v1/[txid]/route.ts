import { NextApiRequest } from "next";

type Params = {
  txid: string;
};

export async function POST(req: NextApiRequest, context: { params: Params }) {
  const { txid } = context.params;

  console.log(`RESPONSE V1 TX ID: ${txid}`);

  return Response.json({ success: true });
}
