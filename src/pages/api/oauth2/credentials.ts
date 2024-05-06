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
  {
      "format": "jwt_vc",
      "credential": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SWxBdE1qVTJJaXdpZUNJNklucDFPR3RMYWpSbFFVWTRTbGQ0TWxSMGN6TllVM1JaZGtWdVVXcHhTMlZrTVMwellrZElZV3QwTTBFaUxDSjVJam9pVkZnMmRGTkdlREIwWVdGNGVHcHZialV4WkRCUllXZ3RkbEF0V25SSU9GZHJWSFp3U0Y5dmVFNW5aeUlzSW10cFpDSTZJazVMZGpSWVFVUmtUVXhpZHpOdlFrcGpSRGRLWDJoTWRIYzJkV05yUVU0dE9YTTVhMUEyWkZsaFYxRWlMQ0poYkdjaU9pSkZVekkxTmlKOSMwIn0.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRW1haWxWZXJpZmllZENyZWRlbnRpYWwiXSwiaWQiOiJ1cm46dXVpZDo5NDVjY2ZlMC1jNjE1LTQ3MzAtOWY0Ny1kODNjOTBhYTZjZDMiLCJpc3N1ZXIiOiJkaWQ6andrOmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJbnAxT0d0TGFqUmxRVVk0U2xkNE1sUjBjek5ZVTNSWmRrVnVVV3B4UzJWa01TMHpZa2RJWVd0ME0wRWlMQ0o1SWpvaVZGZzJkRk5HZURCMFlXRjRlR3B2YmpVeFpEQlJZV2d0ZGxBdFduUklPRmRyVkhad1NGOXZlRTVuWnlJc0ltdHBaQ0k2SWs1TGRqUllRVVJrVFV4aWR6TnZRa3BqUkRkS1gyaE1kSGMyZFdOclFVNHRPWE01YTFBMlpGbGhWMUVpTENKaGJHY2lPaUpGVXpJMU5pSjkiLCJpc3N1YW5jZURhdGUiOiIyMDI0LTA1LTA2VDE1OjMzOjQ2LjkyNFoiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5pSXNJblZ6WlNJNkluTnBaeUlzSW10MGVTSTZJa1ZESWl3aVkzSjJJam9pVUMweU5UWWlMQ0o0SWpvaU4xWmZabmRQTUdkaFNWUllhMFo2WkdoTmJtTjJiRnBTUnpFM1dFSkxjMFl3Y2pCR2NrZzRNRFJXYXlJc0lua2lPaUkwVDBsMUxWaHhkRU5uTURKeldVaEVabTVxZUVoSk1YSjJhVTFtZVUxaVVHdFBWekU0YVU1RlIzVk5JbjAiLCJlbWFpbCI6ImZhY3UubGFyb2NjYUBnbWFpbC5jb20ifSwiZXhwaXJhdGlvbkRhdGUiOiIyMDI1LTA1LTA2VDE1OjMzOjQ2LjkyNFoifSwibmJmIjoxNzE1MDA5NjI2LCJqdGkiOiJ1cm46dXVpZDo5NDVjY2ZlMC1jNjE1LTQ3MzAtOWY0Ny1kODNjOTBhYTZjZDMiLCJpc3MiOiJkaWQ6andrOmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJbnAxT0d0TGFqUmxRVVk0U2xkNE1sUjBjek5ZVTNSWmRrVnVVV3B4UzJWa01TMHpZa2RJWVd0ME0wRWlMQ0o1SWpvaVZGZzJkRk5HZURCMFlXRjRlR3B2YmpVeFpEQlJZV2d0ZGxBdFduUklPRmRyVkhad1NGOXZlRTVuWnlJc0ltdHBaQ0k2SWs1TGRqUllRVVJrVFV4aWR6TnZRa3BqUkRkS1gyaE1kSGMyZFdOclFVNHRPWE01YTFBMlpGbGhWMUVpTENKaGJHY2lPaUpGVXpJMU5pSjkiLCJzdWIiOiJkaWQ6andrOmV5SmhiR2NpT2lKRlV6STFOaUlzSW5WelpTSTZJbk5wWnlJc0ltdDBlU0k2SWtWRElpd2lZM0oySWpvaVVDMHlOVFlpTENKNElqb2lOMVpmWm5kUE1HZGhTVlJZYTBaNlpHaE5ibU4yYkZwU1J6RTNXRUpMYzBZd2NqQkdja2c0TURSV2F5SXNJbmtpT2lJMFQwbDFMVmh4ZEVObk1ESnpXVWhFWm01cWVFaEpNWEoyYVUxbWVVMWlVR3RQVnpFNGFVNUZSM1ZOSW4wIiwiaWF0IjoxNzE1MDA5NjI2LCJleHAiOjE3NDY1NDU2MjZ9.1W95SRStuOHcIyNtekPsMPANFvkOQ4QxhSHU2ApPNhI3TOp2Ad1SWIFGQHqo1jh7gBRvyoEKRBewTVWzMxzJtw",
      "c_nonce": "447ff6da-917c-40c2-a68a-e4c17affd2a6",
      "c_nonce_expires_in": 86400
  }
*/
