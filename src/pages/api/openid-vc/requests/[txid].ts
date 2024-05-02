import createVpPayload from "@/helpers/createVpPayload";
import { getIssuer } from "@/helpers/issuer";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { Jwt } from "@web5/credentials";
import { BearerDid } from "@web5/dids";
import type { NextApiRequest, NextApiResponse } from "next";

const createSignedPresentationDefinition = async (
  issuer: BearerDid,
  options: {
    txid: string;
    state: string;
    nonce: string;
    requirePii: boolean;
    requireEmailVerified: boolean;
    requireKyc: boolean;
  }
): Promise<string> => {
  const payload = createVpPayload({
    did: issuer.uri,
    redirectUri: `${process.env.ISSUER as string}/openid-vc/responses/${
      options.txid
    }`,
    nonce: options.nonce,
    state: options.state,
    requirePii: options.requirePii,
    requireEmailVerified: options.requireEmailVerified,
    requireKyc: options.requireKyc,
  });

  return await Jwt.sign({
    signerDid: issuer,
    payload,
  });
};

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

  console.log(`GET /api/openid-vc/requests/${txid} - Scanned`);

  try {
    const authFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(`GET /api/openid-vc/requests/${txid} - Found`);

    const issuer = await getIssuer();

    const signedPresentationDefinition =
      await createSignedPresentationDefinition(issuer, {
        txid: txid as string,
        nonce: authFlow.nonce,
        state: authFlow.state,
        requirePii: authFlow.data.requirePii,
        requireEmailVerified: authFlow.data.requireEmailVerified,
        requireKyc: authFlow.data.requireKyc,
      });

    console.log(`GET /api/openid-vc/requests/${txid} - Complete.`);

    res.status(200).end(signedPresentationDefinition);
  } catch (error) {
    console.error(
      `GET /api/openid-vc/requests/${txid} - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
