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

    console.log(`[OIDC Operational] POST /api/oauth2/credentials - VC signed`);

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
