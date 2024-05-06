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
              // url: "https://imgs.search.brave.com/zm0BcDb23ENoNk1EIUAWQGOobQrtfZpDiWaePPZlw_M/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXM2LmFscGhhY29k/ZXJzLmNvbS85NzEv/OTcxOTM3LmpwZw",
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              // url: "https://imgs.search.brave.com/V_EQgIx90RTQ5Mj7nCekh9xToXxyghH1IzOWX_1XOhM/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL0UvZXNjdWRv/LXJpdmVyLXBsYXRl/LTIwMjItbG9nby03/NUM5NDA3MkY1LXNl/ZWtsb2dvLmNvbS5w/bmc",
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
              // url: "https://imgs.search.brave.com/zm0BcDb23ENoNk1EIUAWQGOobQrtfZpDiWaePPZlw_M/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXM2LmFscGhhY29k/ZXJzLmNvbS85NzEv/OTcxOTM3LmpwZw",
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              // url: "https://imgs.search.brave.com/V_EQgIx90RTQ5Mj7nCekh9xToXxyghH1IzOWX_1XOhM/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL0UvZXNjdWRv/LXJpdmVyLXBsYXRl/LTIwMjItbG9nby03/NUM5NDA3MkY1LXNl/ZWtsb2dvLmNvbS5w/bmc",
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
              // url: "https://imgs.search.brave.com/zm0BcDb23ENoNk1EIUAWQGOobQrtfZpDiWaePPZlw_M/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXM2LmFscGhhY29k/ZXJzLmNvbS85NzEv/OTcxOTM3LmpwZw",
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/emailVerified/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              // url: "https://imgs.search.brave.com/V_EQgIx90RTQ5Mj7nCekh9xToXxyghH1IzOWX_1XOhM/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL0UvZXNjdWRv/LXJpdmVyLXBsYXRl/LTIwMjItbG9nby03/NUM5NDA3MkY1LXNl/ZWtsb2dvLmNvbS5w/bmc",
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
              // url: "https://imgs.search.brave.com/RfuJcR7HOrsekHvVvQ2RYuFCphV6kQ4IlKrjU-oovFs/rs:fit:860:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXIuZG9nL2xh/cmdlLzIwNTYxNzc0/LmpwZw",
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              // url: "https://imgs.search.brave.com/WgM8-ygvuh_2SPomUskcvsrAijTsPd8AHnK-WpIlUcU/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9sb2dv/cy1kb3dubG9hZC5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MTYvMDUvQXJnZW50/aW5hX25hdGlvbmFs/X2Zvb3RiYWxsX3Rl/YW1fbG9nb19jcmVz/dC00Mzl4NzAwLnBu/Zw",
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
              // url: "https://imgs.search.brave.com/RfuJcR7HOrsekHvVvQ2RYuFCphV6kQ4IlKrjU-oovFs/rs:fit:860:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXIuZG9nL2xh/cmdlLzIwNTYxNzc0/LmpwZw",
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              // url: "https://imgs.search.brave.com/WgM8-ygvuh_2SPomUskcvsrAijTsPd8AHnK-WpIlUcU/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9sb2dv/cy1kb3dubG9hZC5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MTYvMDUvQXJnZW50/aW5hX25hdGlvbmFs/X2Zvb3RiYWxsX3Rl/YW1fbG9nb19jcmVz/dC00Mzl4NzAwLnBu/Zw",
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
              // url: "https://imgs.search.brave.com/RfuJcR7HOrsekHvVvQ2RYuFCphV6kQ4IlKrjU-oovFs/rs:fit:860:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXIuZG9nL2xh/cmdlLzIwNTYxNzc0/LmpwZw",
              url: `${
                process.env.EXTERNAL_SERVER_URI as string
              }/templates/kyc/background.jpg`,
              alt_text: "Empty",
            },
            logo: {
              // url: "https://imgs.search.brave.com/WgM8-ygvuh_2SPomUskcvsrAijTsPd8AHnK-WpIlUcU/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9sb2dv/cy1kb3dubG9hZC5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MTYvMDUvQXJnZW50/aW5hX25hdGlvbmFs/X2Zvb3RiYWxsX3Rl/YW1fbG9nb19jcmVz/dC00Mzl4NzAwLnBu/Zw",
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
