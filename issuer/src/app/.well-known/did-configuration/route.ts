import { NextRequest } from "next/server";
import { getKeyStore } from "@/app/helpers/token";
import jose from "node-jose";

export async function GET(req: NextRequest) {
  const keyStore = await getKeyStore();
  const [key] = keyStore.all({ use: "sig", kty: "EC" });
  const did = `did:jwk:${Buffer.from(JSON.stringify(key.toJSON())).toString(
    "base64"
  )}`;

  const dt = new Date();

  const payload = {
    exp: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    nbf: Math.floor(
      (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
    ),
    iss: did,
    sub: did,
    vc: {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://identity.foundation/.well-known/did-configuration/v1",
      ],
      issuer: did,
      issuanceDate: "2020-12-04T14:08:28-06:00",
      expirationDate: "2025-12-04T14:08:28-06:00",
      type: ["VerifiableCredential", "DomainLinkageCredential"],
      credentialSubject: {
        id: did,
        origin: `${process.env.EXTERNAL_SERVER_URI as string}`,
      },
    },
  };

  const opt = { compact: true, protect: "*", fields: { typ: "JWT" } };
  const token = await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(payload))
    .final();

  const json = {
    "@context": "https://identity.foundation/.well-known/did-configuration/v1",
    linked_dids: [token],
  };

  return Response.json(json);
}
