import dbConnect from "@/lib/dbConnect";
import CredentialOfferDocument from "@/models/credentialOffer";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { v4 as uuidv4 } from "uuid";
import type { NextApiRequest, NextApiResponse } from "next";

const create_credential_offer = (code: string, type: string) => {
  const credential_offer = {
    grants: {
      "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
        "pre-authorized_code": code,
        user_pin_required: false,
      },
    },
    credentials: [type],
    credential_issuer: process.env.ISSUER as string,
  };

  const credential_offer_encoded = encodeURIComponent(
    JSON.stringify(credential_offer)
  );

  const credential_offer_uri_encoded = encodeURIComponent(
    `${process.env.ISSUER as string}/credential-offer/requests/${code}`
  );

  return {
    val: `openid-credential-offer://?credential_offer=${credential_offer_encoded}`,
    ref: `openid-credential-offer://?credential_offer_uri=${credential_offer_uri_encoded}`,
  };
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

  await dbConnect();

  console.info(`POST /api/sign-in/regular - Initiated`);

  try {
    const body: {
      code: string;
      email: string;
      password: string;
      firstname: string;
      lastname: string;
      kycComplete: boolean;
      isEmailVerified: boolean;
    } = req.body;

    const oidc_flow = await AuthenticationFlowDocument.findOneAndDelete({
      code: body.code,
      type: "oidc",
    }).exec();

    console.info(`POST /api/sign-in/regular - Found. ${body.code}`);

    const auth_flow = await AuthenticationFlowDocument.create({
      type: "oidc",
      code: body.code,
      state: oidc_flow.state,
      nonce: oidc_flow.nonce,
      status: "initiated",
      data: {
        email: body.email,
        given_name: body.firstname,
        family_name: body.lastname,
        email_verified: body.isEmailVerified,
        kyc_complete: body.kycComplete,
      },
    });

    let vcRefEmailUri = undefined;
    let vcValEmailUri = undefined;
    let vcRefKycUri = undefined;
    let vcValKycUri = undefined;

    if (body.isEmailVerified) {
      console.info(
        `POST /api/sign-in/regular - Creating credential offer for Email Verification`
      );

      const code = await AuthenticationFlowDocument.create({
        type: "pre-authorized_code",
        code: uuidv4(),
        state: oidc_flow.state,
        nonce: oidc_flow.nonce,
        status: "initiated",
      });

      console.info(
        `POST /api/sign-in/regular - Pre-authorization_code for Email Verification created. ${code.code}`
      );

      await CredentialOfferDocument.create({
        code: code.code,
        status: "offered",
        type: "EmailVerifiedCredential",
        data: {
          email: body.email,
        },
      });

      console.info(
        `POST /api/sign-in/regular - Credential offer for Email Verification created. ${code.code}`
      );

      const { ref, val } = create_credential_offer(
        code.code,
        "EmailVerifiedCredential"
      );

      vcRefEmailUri = ref;
      vcValEmailUri = val;
    }

    if (body.kycComplete) {
      console.info(
        `POST /api/sign-in/regular - Creating credential offer for KYC`
      );

      const code = await AuthenticationFlowDocument.create({
        type: "pre-authorized_code",
        code: uuidv4(),
        state: oidc_flow.state,
        nonce: oidc_flow.nonce,
        status: "initiated",
      });

      console.info(
        `POST /api/sign-in/regular - Pre-authorization_code for KYC created. ${code.code}`
      );

      await CredentialOfferDocument.create({
        code: code.code,
        status: "offered",
        type: "KycCredential",
        data: {
          email: body.email,
          firstname: body.firstname,
          lastname: body.lastname,
        },
      });

      console.info(
        `POST /api/sign-in/regular - Credential offer for KYC created. ${code.code}`
      );

      const { ref, val } = create_credential_offer(code.code, "KycCredential");

      vcRefKycUri = ref;
      vcValKycUri = val;
    }

    console.info(`POST /api/sign-in/regular - Completed`);

    res.status(200).json({
      code: body.code,
      redirectUri: oidc_flow.redirectUri,
      state: oidc_flow.state,
      vcRefEmailUri,
      vcValEmailUri,
      vcRefKycUri,
      vcValKycUri,
    });
  } catch (error) {
    console.error(
      `POST /api/sign-in/regular - Error: ${JSON.stringify(error)}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}
