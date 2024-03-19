import { VerifiableCredential } from "@web5/credentials";

import { webcrypto } from "node:crypto";
// @ts-expect-error ignoring
if (!globalThis.crypto) globalThis.crypto = webcrypto;

class MembershipExample {
  name: String;

  constructor(name: String) {
    this.name = name;
  }
}

export async function GET() {
  const vc = await VerifiableCredential.create({
    type: "MembershipExample",
    issuer: "did:web:my-domain.io",
    subject: "did:web:my-domain.io:test",
    data: new MembershipExample("test"),
  });

  return Response.json({
    success: true,
  });
}
