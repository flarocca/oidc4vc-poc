import dbConnect from "@/lib/dbConnect";
import { NextApiRequest } from "next";
import AuthenticationFlow from "@/models/authentication_flow";
import jose from "node-jose";
import { getKeyStore } from "@/app/helpers/token";
import { JsonWebTokenError } from "jsonwebtoken";
import { NextRequest } from "next/server";

type Params = {
  txid: string;
};

export async function POST(req: NextRequest, context: { params: Params }) {
  await dbConnect();

  const { txid } = context.params;
  // const body: any = await req.text();
  const data: any = await req.formData();

  console.log(`OPENID-VC RESPONSE TX ID: ${txid}`);
  // console.log(`OPENID-VC RESPONSE BODY: ${JSON.stringify(body)}`);
  console.log(`OPENID-VC RESPONSE DATA: ${JSON.stringify(data)}`);

  return new Response(null, {
    status: 204,
  });
}
