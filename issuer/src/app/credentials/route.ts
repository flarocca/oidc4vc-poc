// import { webcrypto } from "node:crypto";
// // @ts-expect-error ignoring
// if (!globalThis.crypto) globalThis.crypto = webcrypto;

import { NextRequest } from "next/server";
import jose from "node-jose";
import { JwtPayload, jwtDecode } from "jwt-decode";
import { VerifiableCredential } from "@web5/credentials";
import { getKeyStore } from "../helpers/token";

class MembershipExample {
  firstName: String;
  lastName: String;
  email: String;

  constructor(firstName: String, lastName: String, email: String) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
  }
}

export async function POST(req: NextRequest) {
  // const data = await req.formData();
  const body = await req.json();

  // console.log(`Credentials DATA - ${JSON.stringify(data)}`);
  // console.log(`Credentials BODY - ${JSON.stringify(body)}`);
  // const payload = {
  //   types: ["MembershipExample"],
  //   format: "jwt_vc_json",
  //   proof: {
  //     proof_type: "jwt",
  //     jwt: "eyJ0eXAiOiJvcGVuaWQ0dmNpLXByb29mK2p3dCIsImFsZyI6IkVTMjU2SyIsImtpZCI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5rc2lMQ0oxYzJVaU9pSnphV2NpTENKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SW5ObFkzQXlOVFpyTVNJc0luZ2lPaUpuWlRKU1JreDJXVkpITFU1ak5rOTVMVTVtTmpGTmNGRTBiM051WjFSNmRWTlJSa1kxYkdGVFNVOWpJaXdpZVNJNklqZEpNelYzVlZwZk9FSklYekExVTJoTWRIWkVTRGh2TWxVMWVEZHJiVEZuV0RGT2RuWmhjMTlRVlZFaWZRIzAifQ.eyJpYXQiOjE3MTA3OTYxMDIuMzc1LCJleHAiOjE3MTA3OTY3NjIuMzc1LCJhdWQiOiJodHRwOi8vMTkyLjE2OC4xLjM2OjMwMDAiLCJub25jZSI6IjQ0N2ZmNmRhLTkxN2MtNDBjMi1hNjhhLWU0YzE3YWZmZDJhNiIsImlzcyI6InNwaGVyZW9uOnNzaS13YWxsZXQiLCJqdGkiOiI4ZWJiODUzMS04YTE3LTQxODYtYmYzZi04OTc1YWIyYjI5NjcifQ.L7FhH71voJ2tcjyFTaq-VQYBq82Pim18U7RxLS-pJe9yh2G1BieGmK34BjYATnI-DyaMc8DlC-Neo5jcDebCSA",
  //   },
  // };

  // Subject
  const decodedHeader = jwtDecode(body.proof.jwt, { header: true });
  const decodedBody = jwtDecode<JwtPayload & { nonce: string }>(body.proof.jwt);
  const subject = decodedHeader.kid || "";

  // console.log(`Credentials HEADER - ${JSON.stringify(decodedHeader)}`);

  // Issuer
  const keyStore = await getKeyStore();
  const [key] = keyStore.all({ use: "sig", kty: "EC" });
  const issuer = `did:jwk:${Buffer.from(JSON.stringify(key.toJSON())).toString(
    "base64"
  )}`;

  // Credentials
  // const credential = new MembershipExample(
  //   "Facundo",
  //   "La Rocca",
  //   "demo@email.io"
  // );
  const issuanceDate = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(issuanceDate.getDate() + 365);

  // Credential
  const vc = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", "MembershipExample"],
    credentialSubject: {
      firstName: "Facundo",
      lastName: "La Rocca",
      mail: "facundo@mightyblock.co",
      id: subject,
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

  // console.log(`Credentials CREDENTIAL - ${JSON.stringify(credential)}`);

  const opt = { compact: true, fields: { typ: "JWT" } };

  const signedJwt = await jose.JWS.createSign(opt, key)
    .update(JSON.stringify(credential))
    .final();

  console.log(`Credentials VC_JWT - ${signedJwt}`);

  return Response.json({
    format: "jwt_vc",
    credential: signedJwt,
    c_nonce: decodedBody.nonce,
    c_nonce_expires_in: 86400,
  });
}
