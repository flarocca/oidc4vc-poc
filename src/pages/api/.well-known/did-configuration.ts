import type { NextApiRequest, NextApiResponse } from "next";
import { getIssuer } from "@/helpers/issuer";
import { VerifiableCredential } from "@web5/credentials";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  console.log(`GET /.well-known/did-configuration - Initiated`);
  try {
    const dt = new Date();

    console.log(`GET /.well-known/did-configuration - Reading DID`);

    const issuer = await getIssuer();

    console.log(
      `GET /.well-known/did-configuration - Creating DID Configuration`
    );

    const vc = await VerifiableCredential.create({
      type: "DomainLinkageCredential",
      issuer: issuer.uri,
      subject: issuer.uri,
      expirationDate: new Date(dt.getTime() + 20 * 60 * 1000).toISOString(),
      data: {
        id: issuer.uri,
        origin: `${process.env.ISSUER?.replace("/api", "") as string}`,
      },
    });

    console.log(
      `GET /.well-known/did-configuration - Signing DID COnfiguration`
    );

    const token = await vc.sign({ did: issuer });

    const json = {
      "@context":
        "https://identity.foundation/.well-known/did-configuration/v1",
      linked_dids: [token],
    };

    console.log(`GET /.well-known/did-configuration - Complete`);

    res.status(200).json(json);
  } catch (error) {
    console.error(
      `GET /.well-known/did-configuration - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
