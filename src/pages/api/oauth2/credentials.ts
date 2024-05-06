import type { NextApiRequest, NextApiResponse } from "next";
import { jwtDecode, JwtPayload } from "jwt-decode";
import CredentialOfferDocument, {
  CredentialOffer,
} from "@/models/credentialOffer";
import { Jwt, VerifiableCredential } from "@web5/credentials";
import { getIssuer } from "@/helpers/issuer";
import { v4 as uuidv4 } from "uuid";

const extractSubjectAndNonce = (
  jwt: string
): { subject: string; nonce: string } => {
  const decodedHeader = jwtDecode(jwt, { header: true });
  const decodedBody = jwtDecode<JwtPayload & { nonce: string }>(jwt);

  return { subject: decodedHeader.kid || "", nonce: decodedBody.nonce };
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

const issueCredentialLegacy = async (
  credentialOffer: CredentialOffer,
  subject: string
) => {
  const issuer = await getIssuer();

  const vc = {
    "@context": ["https://www.w3.org/2018/credentials/v1"],
    type: ["VerifiableCredential", credentialOffer.type],
    credentialSubject: {
      id: subject,
      ...credentialOffer.data,
    },
  };

  const issuanceDate = new Date();
  const expirationDate = new Date();
  expirationDate.setDate(issuanceDate.getDate() + 365);

  const credential = {
    exp: Math.floor((expirationDate.getTime() as unknown as number) / 1000),
    expirationDate: expirationDate.toISOString(),
    nbf: Math.floor(issuanceDate.getTime() / 1000),
    iat: Math.floor(issuanceDate.getTime() / 1000),
    issuanceDate: issuanceDate.toISOString(),
    jti: uuidv4(),
    issuer: issuer.uri,
    iss: issuer.uri,
    sub: subject,
    vc,
    ...vc,
  };

  return await Jwt.sign({
    signerDid: issuer,
    payload: credential,
  });

  // return await Jwt.sign({
  //   signerDid: issuer,
  //   payload: {
  //     vc: credential.vc,
  //     nbf: credential.nbf,
  //     jti: credential.jti,
  //     iss: issuer.uri,
  //     sub: credential.sub,
  //     iat: credential.iat,
  //     exp: credential.exp,
  //     ...vc,
  //   },
  // });
};

const validateAuthentication = (
  req: NextApiRequest,
  res: NextApiResponse
): { isAuthenticated: boolean; token: string | undefined } => {
  const token = req.headers["authorization"]?.split(" ")[1];

  console.log(`POST /api/oauth2/credentials - Validating authorization header`);

  if (!token) {
    console.error(`POST /api/credentials - Authorization header not found`);

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
      `POST /api/oauth2/credentials - Initiated: ${JSON.stringify(
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
      `POST /api/oauth2/credentials - Pre-authorization_code Initiated. ${payload.preAuthorizedCode}`
    );

    const credentialOffer = await CredentialOfferDocument.findOneAndUpdate(
      {
        code: payload.preAuthorizedCode,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(`POST /api/oauth2/credentials - Scanned`);

    const { subject, nonce } = extractSubjectAndNonce(req.body.proof.jwt);
    // const signedJwt = await issueCredential(credentialOffer, subject);
    const signedJwt = await issueCredentialLegacy(credentialOffer, subject);

    console.log(`POST /api/oauth2/credentials - VC signed`);

    res.status(200).json({
      format: "jwt_vc",
      credential: signedJwt,
      c_nonce: nonce,
      c_nonce_expires_in: 86400,
    });
  } catch (error) {
    console.error(
      `POST /api/oauth2/credentials - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
