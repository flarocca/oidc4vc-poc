import { NextRequest } from "next/server";
import CredentialOfferDocument from "@/models/credential_offer";
import AuthenticationFlow from "@/models/authentication_flow";
import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";

const create_credential_offer = (code: string, type: string) => {
  const credential_offer = {
    grants: {
      "urn:ietf:params:oauth:grant-type:pre-authorized_code": {
        "pre-authorized_code": code,
        user_pin_required: false,
      },
    },
    credentials: [type],
    credential_issuer: process.env.EXTERNAL_SERVER_URI as string,
  };

  const credential_offer_encoded = encodeURIComponent(
    JSON.stringify(credential_offer)
  );

  return `openid-credential-offer://?credential_offer=${credential_offer_encoded}`;
};

export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    console.log(`POST /api/sign-in/regular - Initiated`);

    const body: {
      code: string;
      email: string;
      password: string;
      firstname: string;
      lastname: string;
      kycComplete: boolean;
      isEmailVerified: boolean;
    } = await req.json();

    const oidc_flow = await AuthenticationFlow.findOneAndDelete({
      code: body.code,
      type: "oidc",
    }).exec();

    console.log(`POST /api/sign-in/regular - Found. ${body.code}`);

    const auth_flow = await AuthenticationFlow.create({
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

    let vc_email_uri = undefined;
    let vc_kyc_uri = undefined;

    if (body.isEmailVerified) {
      console.log(
        `POST /api/sign-in/regular - Creating credential offer for Email Verification`
      );

      const code = await AuthenticationFlow.create({
        type: "pre-authorized_code",
        code: uuidv4(),
        state: oidc_flow.state,
        nonce: oidc_flow.nonce,
        status: "initiated",
      });

      console.log(
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

      console.log(
        `POST /api/sign-in/regular - Credential offer for Email Verification created. ${code.code}`
      );

      vc_email_uri = create_credential_offer(
        code.code,
        "EmailVerifiedCredential"
      );
    }

    if (body.kycComplete) {
      console.log(
        `POST /api/sign-in/regular - Creating credential offer for KYC`
      );

      const code = await AuthenticationFlow.create({
        type: "pre-authorized_code",
        code: uuidv4(),
        state: oidc_flow.state,
        nonce: oidc_flow.nonce,
        status: "initiated",
      });

      console.log(
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

      console.log(
        `POST /api/sign-in/regular - Credential offer for KYC created. ${code.code}`
      );

      vc_kyc_uri = create_credential_offer(code.code, "KycCredential");
    }

    console.log(`POST /api/sign-in/regular - Completed`);

    return Response.json({
      success: true,
      code: body.code,
      redirectUri: oidc_flow.redirectUri,
      state: oidc_flow.state,
      vc_email_uri,
      vc_kyc_uri,
    });
  } catch (error) {
    console.error(
      `POST /api/sign-in/regular - Error: ${JSON.stringify(error)}`
    );
    return Response.json(
      { code: "internal_server_error", error: JSON.stringify(error) },
      { status: 500, statusText: "internal_server_error" }
    );
  }
}
