import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  console.log(`[OIDC Metadata]  GET /.well-known/openid-credential-issuer`);

  res.status(200).json({
    credential_issuer: `${process.env.ISSUER as string}`,
    credential_endpoint: `${process.env.ISSUER as string}/oauth2/credentials`,
    token_endpoint: `${process.env.ISSUER as string}/oauth2/token`,
    display: [
      {
        name: "Demo Issuer",
        description: "Demo Issuer",
      },
    ],
    credentials_supported: [
      {
        display: [
          {
            name: "Email Verified",
            description: "Email verified credential",
            text_color: "#000000",
            background_image: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/logo.png`,
              alt_text: "Empty",
            },
          },
          {
            locale: "en-US",
            name: "Email Verified",
            description: "Email verified credential",
            text_color: "#000000",
            background_image: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/logo.png`,
              alt_text: "Empty",
            },
          },
          {
            locale: "es-ES",
            name: "Email Verificado",
            description: "Credencial de email verificado",
            text_color: "#000000",
            background_image: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/logo.png`,
              alt_text: "Empty",
            },
          },
        ],
        order: ["email"],
        credentialSubject: {
          email: {
            value_type: "string",
            display: [
              {
                name: "Email",
              },
              {
                name: "Email",
                locale: "en-US",
              },
              {
                name: "Email",
                locale: "es-ES",
              },
            ],
          },
        },
        id: "EmailVerifiedCredential",
        types: ["VerifiableCredential", "EmailVerifiedCredential"],
        format: "jwt_vc_json",
        cryptographic_binding_methods_supported: ["did:jwk"],
        cryptographic_suites_supported: ["ES256"],
      },
      {
        display: [
          {
            name: "KYC",
            description: "KYC credential",
            text_color: "#FFFFFF",
            background_image: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/logo.png`,
              alt_text: "Empty",
            },
          },
          {
            locale: "en-US",
            name: "KYC",
            description: "KYC credential",
            text_color: "#FFFFFF",
            background_image: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/logo.png`,
              alt_text: "Empty",
            },
          },
          {
            locale: "es-ES",
            name: "KYC",
            description: "Credencial de KYC",
            text_color: "#FFFFFF",
            background_image: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/logo.png`,
              alt_text: "Empty",
            },
          },
        ],
        order: ["firstName", "lastName", "email"],
        credentialSubject: {
          firstName: {
            value_type: "string",
            display: [
              {
                name: "First Name",
              },
              {
                name: "First Name",
                locale: "en-US",
              },
              {
                name: "Nombre",
                locale: "es-ES",
              },
            ],
          },
          lastName: {
            value_type: "string",
            display: [
              {
                name: "Last Name",
              },
              {
                name: "Last Name",
                locale: "en-US",
              },
              {
                name: "Apellido",
                locale: "es-ES",
              },
            ],
          },
          email: {
            value_type: "string",
            display: [
              {
                name: "Email",
              },
              {
                name: "Email",
                locale: "en-US",
              },
              {
                name: "Email",
                locale: "es-ES",
              },
            ],
          },
        },
        id: "KycCredential",
        types: ["VerifiableCredential", "KycCredential"],
        format: "jwt_vc_json",
        cryptographic_binding_methods_supported: ["did:jwk"],
        cryptographic_suites_supported: ["ES256"],
      },
    ],
    credential_supplier_config: {
      templates_base_dir: "templates",
      template_mappings: [
        {
          credential_types: ["EmailVerifiedCredential"],
          template_path: "emailVerified/EmailVerifiedCredential.hbs",
          format: "jwt_vc_json",
        },
        {
          credential_types: ["KycCredential"],
          template_path: "kyc/KycCredential.hbs",
          format: "jwt_vc_json",
        },
      ],
    },
  });
}
