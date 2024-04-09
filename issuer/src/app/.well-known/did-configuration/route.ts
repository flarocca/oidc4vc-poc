import { NextRequest } from "next/server";
import jose from "node-jose";
import { getKeyStore } from "../../helpers/token";

export async function GET(req: NextRequest) {
  try {
    console.log(`GET /.well-known/did-configuration - Initiated`);

    const keyStore = await getKeyStore();
    const [key] = keyStore.all({ use: "sig", kty: "EC" });
    const did = `did:jwk:${Buffer.from(JSON.stringify(key.toJSON())).toString(
      "base64"
    )}`;

    console.log(`GET /.well-known/did-configuration - Reading DID`);

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
      "@context":
        "https://identity.foundation/.well-known/did-configuration/v1",
      linked_dids: [token],
    };

    console.log(`GET /.well-known/did-configuration - Complete`);

    return Response.json(json);
  } catch (error) {
    console.error(
      `GET /.well-known/did-configuration - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { success: false, error },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
