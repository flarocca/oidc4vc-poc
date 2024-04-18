import { getIssuer } from "@/helpers/issuer";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { Jwt } from "@web5/credentials";
import type { NextApiRequest, NextApiResponse } from "next";

/*
Example:

JWT: eyJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5pSXNJblZ6WlNJNkluTnBaeUlzSW10MGVTSTZJa1ZESWl3aVkzSjJJam9pVUMweU5UWWlMQ0o0SWpvaVZFY3lTREo0TW1SWFdFNHpkVU54V25CeFJqRjVjMEZRVVZaRVNrVk9YMGd0UTAxMFltZHFZaTFPWnlJc0lua2lPaUk1VFRoT2VHUXdVRTR5TWswNWJGQkVlR1J3UkhCdlZFeDZNVFYzWm5sYVNuTTJXbWhMU1ZWS016TTRJbjAjMCIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTM0NTM0NDksImV4cCI6MTcxMzQ1MzU2OSwicmVzcG9uc2VfdHlwZSI6InZwX3Rva2VuIiwic2NvcGUiOiJvcGVuaWQiLCJjbGllbnRfaWQiOiJkaWQ6andrOmV5SmhiR2NpT2lKRlV6STFOaUlzSW5WelpTSTZJbk5wWnlJc0ltdDBlU0k2SWtWRElpd2lZM0oySWpvaVVDMHlOVFlpTENKNElqb2lWRWN5U0RKNE1tUlhXRTR6ZFVOeFduQnhSakY1YzBGUVVWWkVTa1ZPWDBndFEwMTBZbWRxWWkxT1p5SXNJbmtpT2lJNVRUaE9lR1F3VUU0eU1rMDViRkJFZUdSd1JIQnZWRXg2TVRWM1pubGFTbk0yV21oTFNWVktNek00SW4wIiwicmVzcG9uc2VfdXJpIjoiaHR0cHM6Ly9zc2kuZHV0Y2hibG9ja2NoYWluY29hbGl0aW9uLm9yZy9hZ2VudC9zaW9wL2RlZmluaXRpb25zL2RiYzIwMjMvYXV0aC1yZXNwb25zZXMvOThjNGExMzgtNmIxMy00YWM0LTliYmEtNTVkYzYxMDdmNGI1IiwicmVzcG9uc2VfbW9kZSI6ImRpcmVjdF9wb3N0Iiwibm9uY2UiOiI2NDVmOGZlYS00NmMxLTRhYmMtODYyYi05ZGU0NmU1YzA4ZGQiLCJzdGF0ZSI6Ijk4YzRhMTM4LTZiMTMtNGFjNC05YmJhLTU1ZGM2MTA3ZjRiNSIsImNsaWVudF9tZXRhZGF0YSI6eyJpZF90b2tlbl9zaWduaW5nX2FsZ192YWx1ZXNfc3VwcG9ydGVkIjpbIkVTMjU2Il0sInJlcXVlc3Rfb2JqZWN0X3NpZ25pbmdfYWxnX3ZhbHVlc19zdXBwb3J0ZWQiOlsiRVMyNTYiXSwicmVzcG9uc2VfdHlwZXNfc3VwcG9ydGVkIjpbImlkX3Rva2VuIiwidnBfdG9rZW4iXSwic2NvcGVzX3N1cHBvcnRlZCI6WyJvcGVuaWQgZGlkX2F1dGhuIl0sInN1YmplY3RfdHlwZXNfc3VwcG9ydGVkIjpbInBhaXJ3aXNlIl0sInN1YmplY3Rfc3ludGF4X3R5cGVzX3N1cHBvcnRlZCI6WyJkaWQ6d2ViIiwiZGlkOmp3ayJdLCJ2cF9mb3JtYXRzIjp7Imp3dF92Y19qc29uIjp7ImFsZyI6WyJFUzI1NiJdfSwiand0X3ZwX2pzb24iOnsiYWxnIjpbIkVTMjU2Il19LCJqd3RfdmMiOnsiYWxnIjpbIkVTMjU2Il19LCJqd3RfdnAiOnsiYWxnIjpbIkVTMjU2Il19fX0sInByZXNlbnRhdGlvbl9kZWZpbml0aW9uIjp7ImlkIjoiZGJjMjAyMyIsInB1cnBvc2UiOiJGb3IgdGhpcyBwb3J0YWwgd2UgbmVlZCB5b3VyIERJSVAgdjIgY3JlZGVudGlhbCIsImZvcm1hdCI6eyJqd3RfdmNfanNvbiI6eyJhbGciOlsiRVMyNTYiXX0sImp3dF92cF9qc29uIjp7ImFsZyI6WyJFUzI1NiJdfSwiand0X3ZjIjp7ImFsZyI6WyJFUzI1NiJdfSwiand0X3ZwIjp7ImFsZyI6WyJFUzI1NiJdfX0sImlucHV0X2Rlc2NyaXB0b3JzIjpbeyJpZCI6IjRjZTdhZmYxLTAyMzQtNGYzNS05ZDIxLTI1MTY2OGE2MDk1MCIsIm5hbWUiOiJESUlQdjIgY29uZm9ybWFuY2UiLCJwdXJwb3NlIjoiWW91IG5lZWQgdG8gcHJvdmlkZSBhIERJSVB2MiBjb25mb3JtYW50IGNyZWRlbnRpYWwiLCJjb25zdHJhaW50cyI6eyJmaWVsZHMiOlt7InBhdGgiOlsiJC5pc3N1ZXIuaWQiLCIkLmlzc3VlciIsIiQudmMuaXNzdWVyLmlkIiwiJC52Yy5pc3N1ZXIiLCIkLmlzcyJdLCJmaWx0ZXIiOnsidHlwZSI6InN0cmluZyIsInBhdHRlcm4iOiJeZGlkOihqd2t8d2ViKTouezUsMjA0OH0kIn19LHsicGF0aCI6WyIkLmNyZWRlbnRpYWxTdWJqZWN0LmlkIiwiJC52Yy5jcmVkZW50aWFsU3ViamVjdC5pZCJdLCJmaWx0ZXIiOnsidHlwZSI6InN0cmluZyIsInBhdHRlcm4iOiJeZGlkOihqd2t8d2ViKTouezUsMjA0OH0kIn19LHsicGF0aCI6WyIkLnZjLmNyZWRlbnRpYWxTdWJqZWN0LmZpcnN0TmFtZSIsIiQuY3JlZGVudGlhbFN1YmplY3QuZmlyc3ROYW1lIl0sImZpbHRlciI6eyJ0eXBlIjoic3RyaW5nIiwicGF0dGVybiI6Il4uezEsNjR9JCJ9fSx7InBhdGgiOlsiJC52Yy5jcmVkZW50aWFsU3ViamVjdC5sYXN0TmFtZSIsIiQuY3JlZGVudGlhbFN1YmplY3QubGFzdE5hbWUiXSwiZmlsdGVyIjp7InR5cGUiOiJzdHJpbmciLCJwYXR0ZXJuIjoiXi57MSw2NH0kIn19LHsicGF0aCI6WyIkLnZjLmNyZWRlbnRpYWxTdWJqZWN0LmVtYWlsQWRkcmVzcyIsIiQuY3JlZGVudGlhbFN1YmplY3QuZW1haWxBZGRyZXNzIl0sImZpbHRlciI6eyJ0eXBlIjoic3RyaW5nIiwicGF0dGVybiI6Il4uezEsMTI4fSQifX1dfX1dfSwibmJmIjoxNzEzNDUzNDQ5LCJqdGkiOiJhNTFmZWJjMy02NmZmLTQxZGQtYTYwMy01NDMwMGQ3OTYxMGEiLCJpc3MiOiJkaWQ6andrOmV5SmhiR2NpT2lKRlV6STFOaUlzSW5WelpTSTZJbk5wWnlJc0ltdDBlU0k2SWtWRElpd2lZM0oySWpvaVVDMHlOVFlpTENKNElqb2lWRWN5U0RKNE1tUlhXRTR6ZFVOeFduQnhSakY1YzBGUVVWWkVTa1ZPWDBndFEwMTBZbWRxWWkxT1p5SXNJbmtpT2lJNVRUaE9lR1F3VUU0eU1rMDViRkJFZUdSd1JIQnZWRXg2TVRWM1pubGFTbk0yV21oTFNWVktNek00SW4wIiwic3ViIjoiZGlkOmp3azpleUpoYkdjaU9pSkZVekkxTmlJc0luVnpaU0k2SW5OcFp5SXNJbXQwZVNJNklrVkRJaXdpWTNKMklqb2lVQzB5TlRZaUxDSjRJam9pVkVjeVNESjRNbVJYV0U0emRVTnhXbkJ4UmpGNWMwRlFVVlpFU2tWT1gwZ3RRMDEwWW1kcVlpMU9aeUlzSW5raU9pSTVUVGhPZUdRd1VFNHlNazA1YkZCRWVHUndSSEJ2VkV4Nk1UVjNabmxhU25NMldtaExTVlZLTXpNNEluMCJ9.LkQKQs_i7YvNM0V6nx95o8pCiJU3WNFjkIGwie_OkXNNyeM3uqySwpAr9whB9RGEC0qZu9VvHP42yHGhRO9nYA
Payload:
{
  "iat": 1713453449,
  "exp": 1713453569,
  "response_type": "vp_token",
  "scope": "openid",
  "client_id": "did:jwk:eyJhbGciOiJFUzI1NiIsInVzZSI6InNpZyIsImt0eSI6IkVDIiwiY3J2IjoiUC0yNTYiLCJ4IjoiVEcySDJ4MmRXWE4zdUNxWnBxRjF5c0FQUVZESkVOX0gtQ010YmdqYi1OZyIsInkiOiI5TThOeGQwUE4yMk05bFBEeGRwRHBvVEx6MTV3ZnlaSnM2WmhLSVVKMzM4In0",
  "response_uri": "https://ssi.dutchblockchaincoalition.org/agent/siop/definitions/dbc2023/auth-responses/98c4a138-6b13-4ac4-9bba-55dc6107f4b5",
  "response_mode": "direct_post",
  "nonce": "645f8fea-46c1-4abc-862b-9de46e5c08dd",
  "state": "98c4a138-6b13-4ac4-9bba-55dc6107f4b5",
  "client_metadata": {
    "id_token_signing_alg_values_supported": [
      "ES256"
    ],
    "request_object_signing_alg_values_supported": [
      "ES256"
    ],
    "response_types_supported": [
      "id_token",
      "vp_token"
    ],
    "scopes_supported": [
      "openid did_authn"
    ],
    "subject_types_supported": [
      "pairwise"
    ],
    "subject_syntax_types_supported": [
      "did:web",
      "did:jwk"
    ],
    "vp_formats": {
      "jwt_vc_json": {
        "alg": [
          "ES256"
        ]
      },
      "jwt_vp_json": {
        "alg": [
          "ES256"
        ]
      },
      "jwt_vc": {
        "alg": [
          "ES256"
        ]
      },
      "jwt_vp": {
        "alg": [
          "ES256"
        ]
      }
    }
  },
  "presentation_definition": {
    "id": "dbc2023",
    "purpose": "For this portal we need your DIIP v2 credential",
    "format": {
      "jwt_vc_json": {
        "alg": [
          "ES256"
        ]
      },
      "jwt_vp_json": {
        "alg": [
          "ES256"
        ]
      },
      "jwt_vc": {
        "alg": [
          "ES256"
        ]
      },
      "jwt_vp": {
        "alg": [
          "ES256"
        ]
      }
    },
    "input_descriptors": [
      {
        "id": "4ce7aff1-0234-4f35-9d21-251668a60950",
        "name": "DIIPv2 conformance",
        "purpose": "You need to provide a DIIPv2 conformant credential",
        "constraints": {
          "fields": [
            {
              "path": [
                "$.issuer.id",
                "$.issuer",
                "$.vc.issuer.id",
                "$.vc.issuer",
                "$.iss"
              ],
              "filter": {
                "type": "string",
                "pattern": "^did:(jwk|web):.{5,2048}$"
              }
            },
            {
              "path": [
                "$.credentialSubject.id",
                "$.vc.credentialSubject.id"
              ],
              "filter": {
                "type": "string",
                "pattern": "^did:(jwk|web):.{5,2048}$"
              }
            },
            {
              "path": [
                "$.vc.credentialSubject.firstName",
                "$.credentialSubject.firstName"
              ],
              "filter": {
                "type": "string",
                "pattern": "^.{1,64}$"
              }
            },
            {
              "path": [
                "$.vc.credentialSubject.lastName",
                "$.credentialSubject.lastName"
              ],
              "filter": {
                "type": "string",
                "pattern": "^.{1,64}$"
              }
            },
            {
              "path": [
                "$.vc.credentialSubject.emailAddress",
                "$.credentialSubject.emailAddress"
              ],
              "filter": {
                "type": "string",
                "pattern": "^.{1,128}$"
              }
            }
          ]
        }
      }
    ]
  },
  "nbf": 1713453449,
  "jti": "a51febc3-66ff-41dd-a603-54300d79610a",
  "iss": "did:jwk:eyJhbGciOiJFUzI1NiIsInVzZSI6InNpZyIsImt0eSI6IkVDIiwiY3J2IjoiUC0yNTYiLCJ4IjoiVEcySDJ4MmRXWE4zdUNxWnBxRjF5c0FQUVZESkVOX0gtQ010YmdqYi1OZyIsInkiOiI5TThOeGQwUE4yMk05bFBEeGRwRHBvVEx6MTV3ZnlaSnM2WmhLSVVKMzM4In0",
  "sub": "did:jwk:eyJhbGciOiJFUzI1NiIsInVzZSI6InNpZyIsImt0eSI6IkVDIiwiY3J2IjoiUC0yNTYiLCJ4IjoiVEcySDJ4MmRXWE4zdUNxWnBxRjF5c0FQUVZESkVOX0gtQ010YmdqYi1OZyIsInkiOiI5TThOeGQwUE4yMk05bFBEeGRwRHBvVEx6MTV3ZnlaSnM2WmhLSVVKMzM4In0"
}
*/

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

  console.log(`GET /api/siop/requests/${txid} - Initiated`);

  try {
    const authFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "siop",
        code: txid,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(`GET /api/siop/requests/${txid} - Found`);

    const issuer = await getIssuer();

    const dt = new Date();
    const payload = {
      iat: Math.floor(dt.getTime() / 1000),
      exp: Math.floor(
        (new Date(dt.getTime() + 20 * 60 * 1000) as unknown as number) / 1000
      ),
      response_type: "vp_token",
      scope: "openid",
      client_id: issuer.uri,
      response_uri: `${
        process.env.EXTERNAL_SERVER_URI as string
      }/api/siop/responses/${txid}`,
      response_mode: "post",
      nonce: authFlow.nonce,
      state: authFlow.state,
      client_metadata: {
        id_token_signing_alg_values_supported: ["EdDSA", "ES256", "ES256K"],
        request_object_signing_alg_values_supported: [
          "EdDSA",
          "ES256",
          "ES256K",
        ],
        response_types_supported: ["id_token"],
        scopes_supported: ["openid did_authn"],
        subject_types_supported: ["pairwise"],
        subject_syntax_types_supported: ["did:key", "did:jwk"],
        vp_formats: {
          jwt_vc: {
            alg: ["EdDSA", "ES256K"],
          },
          jwt_vp: {
            alg: ["ES256K", "EdDSA"],
          },
        },
      },
      // claims: {
      //   vp_token: {
      presentation_definition: {
        id: "authn-with-vc",
        purpose: "Authentication using VCs",
        input_descriptors: [
          {
            id: "basic-information",
            name: "Basic Information",
            purpose: "Authenticate you using basic information",
            constraints: {
              fields: [
                {
                  path: [
                    "$.credentialSubject.email",
                    "$.vc.credentialSubject.email",
                    "$.credentialSubject.emailAddress",
                    "$.vc.credentialSubject.emailAddress",
                  ],
                },
              ],
            },
          },
        ],
      },
      //   },
      // },
      nbf: Math.floor(dt.getTime() / 1000),
      jti: "f4c8373d-d5ae-4eef-bf43-8da13f6ff5dd",
      iss: issuer.uri,
      sub: issuer.uri,
    };

    const signegJwt = await Jwt.sign({
      signerDid: issuer,
      payload,
    });

    console.log(`GET /api/siop/requests/${txid} - Complete`);

    res.status(200).end(signegJwt);
  } catch (error) {
    console.error(
      `GET /api/siop/requests/${txid} - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
