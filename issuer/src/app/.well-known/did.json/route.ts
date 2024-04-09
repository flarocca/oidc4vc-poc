import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  console.log(`GET /.well-known/did.json`);

  return Response.json({
    "@context": [
      "https://www.w3.org/ns/did/v1",
      {
        "@vocab": "https://www.iana.org/assignments/jose#",
      },
    ],
    id: "did:jwk:eyJrdHkiOiJFQyIsImtpZCI6IjFOMWFFZmVOOFlJb25yeGlwUFhvNmEyY3BMSGJSdGJHSkduajFNdXNhUFUiLCJ1c2UiOiJzaWciLCJhbGciOiJFUzI1NiIsImNydiI6IlAtMjU2IiwieCI6IjUxTXA0R0lhTGpmXzJTRTlPWjZycGJzQ1Bhc0xEcWRIMlg1eG5LaWdqQTAiLCJ5IjoidDIyZjNUcWVRNkpfdThqZHZyeEppWVRaOFBBZDkyZUw2WkNBOUNtbDdnVSJ9",
    verificationMethod: [
      {
        id: "#0",
        type: "JsonWebKey2020",
        controller:
          "did:jwk:eyJrdHkiOiJFQyIsImtpZCI6IjFOMWFFZmVOOFlJb25yeGlwUFhvNmEyY3BMSGJSdGJHSkduajFNdXNhUFUiLCJ1c2UiOiJzaWciLCJhbGciOiJFUzI1NiIsImNydiI6IlAtMjU2IiwieCI6IjUxTXA0R0lhTGpmXzJTRTlPWjZycGJzQ1Bhc0xEcWRIMlg1eG5LaWdqQTAiLCJ5IjoidDIyZjNUcWVRNkpfdThqZHZyeEppWVRaOFBBZDkyZUw2WkNBOUNtbDdnVSJ9",
        publicKeyJwk: {
          kty: "EC",
          kid: "1N1aEfeN8YIonrxipPXo6a2cpLHbRtbGJGnj1MusaPU",
          use: "sig",
          alg: "ES256",
          crv: "P-256",
          x: "51Mp4GIaLjf_2SE9OZ6rpbsCPasLDqdH2X5xnKigjA0",
          y: "t22f3TqeQ6J_u8jdvrxJiYTZ8PAd92eL6ZCA9Cml7gU",
        },
      },
    ],
    authentication: ["#0"],
    assertionMethod: ["#0"],
    capabilityInvocation: ["#0"],
    capabilityDelegation: ["#0"],
  });
}
