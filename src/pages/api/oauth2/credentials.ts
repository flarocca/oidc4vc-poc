import type { NextApiRequest, NextApiResponse } from "next";
import { jwtDecode, JwtPayload } from "jwt-decode";
import CredentialOfferDocument, {
  CredentialOffer,
} from "@/models/credentialOffer";
import { VerifiableCredential } from "@web5/credentials";
import { getIssuer } from "@/helpers/issuer";

const extractSubjectAndNonce = (
  jwt: string
): { subject: string; nonce: string } => {
  const decodedBody = jwtDecode<JwtPayload & { nonce: string }>(jwt);

  return { subject: decodedBody.iss || "", nonce: decodedBody.nonce };
};

const issueCredential = async (
  credentialOffer: CredentialOffer,
  subject: string
): Promise<string> => {
  const issuer = await getIssuer();

  const issuanceDate = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(issuanceDate.getDate() + 365);

  const credential = await VerifiableCredential.create({
    type: credentialOffer.type,
    issuer: issuer.uri,
    subject,
    issuanceDate: issuanceDate.toISOString(),
    expirationDate: expirationDate.toISOString(),
    data: credentialOffer.data,
  });

  return await credential.sign({ did: issuer });
};

const validateAuthentication = (
  req: NextApiRequest,
  res: NextApiResponse
): { isAuthenticated: boolean; token: string | undefined } => {
  const token = req.headers["authorization"]?.split(" ")[1];

  console.log(
    `[OIDC Operational] POST /api/oauth2/credentials - Validating authorization header`
  );

  if (!token) {
    console.error(
      `[OIDC Operational] POST /api/credentials - Authorization header not found`
    );

    res.statusCode = 401;
    res.statusMessage = "unauthorized";
    res.status(401).json({});

    return { isAuthenticated: false, token };
  }

  return { isAuthenticated: true, token };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    console.log(
      `[OIDC Operational] POST /api/oauth2/credentials - Initiated: ${JSON.stringify(
        req.body,
        null,
        4
      )}`
    );

    const { isAuthenticated, token } = validateAuthentication(req, res);
    if (!isAuthenticated || !token) {
      return;
    }

    const payload: {
      preAuthorizedCode: string;
    } = jwtDecode(token);

    console.log(
      `[OIDC Operational] POST /api/oauth2/credentials - Pre-authorization_code Initiated. ${payload.preAuthorizedCode}`
    );

    const credentialOffer = await CredentialOfferDocument.findOneAndUpdate(
      {
        code: payload.preAuthorizedCode,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(`[OIDC Operational] POST /api/oauth2/credentials - Scanned`);

    const { subject, nonce } = extractSubjectAndNonce(req.body.proof.jwt);
    const signedJwt = await issueCredential(credentialOffer, subject);

    console.log(
      `[OIDC Operational] POST /api/oauth2/credentials - VC signed ${JSON.stringify(
        {
          format: "jwt_vc",
          credential: signedJwt,
          c_nonce: nonce,
          c_nonce_expires_in: 86400,
        },
        null,
        4
      )}`
    );

    res.status(200).json({
      format: "jwt_vc",
      credential: signedJwt,
      c_nonce: nonce,
      c_nonce_expires_in: 86400,
    });
  } catch (error) {
    console.error(
      `[OIDC Operational] POST /api/oauth2/credentials - Error: ${JSON.stringify(
        error
      )}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}

/*
Request
  Header [Authorization: Bearer {access_token}]
  Body {
      "types": [
          "VerifiableCredential",
          "EmailVerifiedCredential"
      ],
      "format": "jwt_vc_json",
      "proof": {
          "proof_type": "jwt",
          "jwt": "eyJ0eXAiOiJvcGVuaWQ0dmNpLXByb29mK2p3dCIsImFsZyI6IkVTMjU2Iiwia2lkIjoiZGlkOmp3azpleUpoYkdjaU9pSkZVekkxTmlJc0luVnpaU0k2SW5OcFp5SXNJbXQwZVNJNklrVkRJaXdpWTNKMklqb2lVQzB5TlRZaUxDSjRJam9pTjFaZlpuZFBNR2RoU1ZSWWEwWjZaR2hOYm1OMmJGcFNSekUzV0VKTGMwWXdjakJHY2tnNE1EUldheUlzSW5raU9pSTBUMGwxTFZoeGRFTm5NREp6V1VoRVptNXFlRWhKTVhKMmFVMW1lVTFpVUd0UFZ6RTRhVTVGUjNWTkluMCMwIn0.eyJpYXQiOjE3MTUwMDczODYsImV4cCI6MTcxNTAwODA0NiwiYXVkIjoiaHR0cHM6Ly9vaWRjLXBvYy5zYW5kYm94LmFjY291bnRzLmZvcnRlLmlvLy9hcGkiLCJub25jZSI6IjQ0N2ZmNmRhLTkxN2MtNDBjMi1hNjhhLWU0YzE3YWZmZDJhNiIsImlzcyI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5pSXNJblZ6WlNJNkluTnBaeUlzSW10MGVTSTZJa1ZESWl3aVkzSjJJam9pVUMweU5UWWlMQ0o0SWpvaU4xWmZabmRQTUdkaFNWUllhMFo2WkdoTmJtTjJiRnBTUnpFM1dFSkxjMFl3Y2pCR2NrZzRNRFJXYXlJc0lua2lPaUkwVDBsMUxWaHhkRU5uTURKeldVaEVabTVxZUVoSk1YSjJhVTFtZVUxaVVHdFBWekU0YVU1RlIzVk5JbjAiLCJqdGkiOiI4ZjFlYzMyMy1kOGM0LTRkMzUtOTdiNy0wZjE3ZWEwYmQ3M2EifQ.MkRicxbFtbabJCS08NXdlE9tuwyQnqKXqXbujEcjjkjSB5zxjq5lKHwgpN5QZlDGETRBTSdUrhKj1hKI8t1QgA"
      }
  }

Response
*/
