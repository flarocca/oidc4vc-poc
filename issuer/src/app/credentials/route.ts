import { NextRequest } from "next/server";
import jose from "node-jose";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { getKeyStore } from "../helpers/token";
import { headers } from "next/headers";
import CredentialOfferDocument from "@/models/credential_offer";

export async function POST(req: NextRequest) {
  try {
    console.log(`POST /credentials - Initiated`);

    const token = headers().get("authorization")?.split(" ")[1];

    console.log(`POST /credentials - Validating authorization header`);

    if (!token) {
      console.error(`POST /credentials - Authorization header not found`);
      return Response.json({}, { status: 401, statusText: "unauthorized" });
    }

    const payload: {
      preAuthorizedCode: string;
    } = jwtDecode(token);

    console.log(
      `POST /credentials - Pre-authorization_code Initiated. ${payload.preAuthorizedCode}`
    );

    const credential_offer = await CredentialOfferDocument.findOneAndUpdate(
      {
        code: payload.preAuthorizedCode,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(`POST /credentials - Scanned`);

    const body = await req.json();

    // Subject
    const decodedHeader = jwtDecode(body.proof.jwt, { header: true });
    const decodedBody = jwtDecode<JwtPayload & { nonce: string }>(
      body.proof.jwt
    );
    const subject = decodedHeader.kid || "";

    // Issuer
    const keyStore = await getKeyStore();
    const [key] = keyStore.all({ use: "sig", kty: "EC" });
    const issuer = `did:jwk:${Buffer.from(
      JSON.stringify(key.toJSON())
    ).toString("base64")}`;

    // Credentials
    const issuanceDate = new Date();
    const expirationDate = new Date();
    expirationDate.setDate(issuanceDate.getDate() + 365);

    // Credential
    const vc = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      type: ["VerifiableCredential", credential_offer.type],
      credentialSubject: {
        id: subject,
        ...credential_offer.data,
      },
    };

    const credential = {
      exp: Math.floor((expirationDate.getTime() as unknown as number) / 1000),
      expirationDate: expirationDate.toISOString(),
      nbf: Math.floor(issuanceDate.getTime() / 1000),
      issuanceDate: issuanceDate.toISOString(),
      issuer,
      iss: issuer,
      sub: subject,
      vc,
      ...vc,
    };

    const opt = { compact: true, fields: { typ: "JWT" } };

    const signedJwt = await jose.JWS.createSign(opt, key)
      .update(JSON.stringify(credential))
      .final();

    console.log(`POST /credentials - JWT signed`);

    return Response.json({
      format: "jwt_vc",
      credential: signedJwt,
      c_nonce: decodedBody.nonce,
      c_nonce_expires_in: 86400,
    });
  } catch (error) {
    console.error(`POST /credentials - Error: ${JSON.stringify(error)}`);
    return Response.json(
      { code: "internal_server_error", error: JSON.stringify(error) },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
