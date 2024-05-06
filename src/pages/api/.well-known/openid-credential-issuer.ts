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
              url: "https://imgs.search.brave.com/zm0BcDb23ENoNk1EIUAWQGOobQrtfZpDiWaePPZlw_M/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXM2LmFscGhhY29k/ZXJzLmNvbS85NzEv/OTcxOTM3LmpwZw",
              alt_text: "Empty",
            },
            logo: {
              url: "https://imgs.search.brave.com/V_EQgIx90RTQ5Mj7nCekh9xToXxyghH1IzOWX_1XOhM/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL0UvZXNjdWRv/LXJpdmVyLXBsYXRl/LTIwMjItbG9nby03/NUM5NDA3MkY1LXNl/ZWtsb2dvLmNvbS5w/bmc",
              alt_text: "Empty",
            },
          },
          {
            locale: "en-US",
            name: "Email Verified",
            description: "Email verified credential",
            text_color: "#000000",
            background_image: {
              url: "https://imgs.search.brave.com/zm0BcDb23ENoNk1EIUAWQGOobQrtfZpDiWaePPZlw_M/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXM2LmFscGhhY29k/ZXJzLmNvbS85NzEv/OTcxOTM3LmpwZw",
              alt_text: "Empty",
            },
            logo: {
              url: "https://imgs.search.brave.com/V_EQgIx90RTQ5Mj7nCekh9xToXxyghH1IzOWX_1XOhM/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL0UvZXNjdWRv/LXJpdmVyLXBsYXRl/LTIwMjItbG9nby03/NUM5NDA3MkY1LXNl/ZWtsb2dvLmNvbS5w/bmc",
              alt_text: "Empty",
            },
          },
          {
            locale: "es-ES",
            name: "Email Verificado",
            description: "Credencial de email verificado",
            text_color: "#000000",
            background_image: {
              url: "https://imgs.search.brave.com/zm0BcDb23ENoNk1EIUAWQGOobQrtfZpDiWaePPZlw_M/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXM2LmFscGhhY29k/ZXJzLmNvbS85NzEv/OTcxOTM3LmpwZw",
              alt_text: "Empty",
            },
            logo: {
              url: "https://imgs.search.brave.com/V_EQgIx90RTQ5Mj7nCekh9xToXxyghH1IzOWX_1XOhM/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL0UvZXNjdWRv/LXJpdmVyLXBsYXRl/LTIwMjItbG9nby03/NUM5NDA3MkY1LXNl/ZWtsb2dvLmNvbS5w/bmc",
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
            name: "KYC Credential",
            description: "KYC credential",
            text_color: "#FFFFFF",
            background_image: {
              url: "https://img.freepik.com/foto-gratis/papel-acuarela-amarillo_95678-446.jpg",
              alt_text: "Empty",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
              alt_text: "Empty",
            },
          },
          {
            locale: "en-US",
            name: "KYC Credential",
            description: "KYC credential for demo purposes.",
            text_color: "#FFFFFF",
            background_image: {
              url: "https://img.freepik.com/foto-gratis/papel-acuarela-amarillo_95678-446.jpg",
              alt_text: "Empty",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
              alt_text: "Empty",
            },
          },
          {
            locale: "es-ES",
            name: "Credencial de prueba de KYC",
            description:
              "Credencial de ejemplo de KYC solo apta para demostraciones.",
            text_color: "#FFFFFF",
            background_image: {
              url: "https://img.freepik.com/foto-gratis/papel-acuarela-amarillo_95678-446.jpg",
              alt_text: "Empty",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
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
          template_path: "EmailVerifiedCredential.hbs",
          format: "jwt_vc_json",
        },
        {
          credential_types: ["KycCredential"],
          template_path: "KycCredential.hbs",
          format: "jwt_vc_json",
        },
      ],
    },
  });
}
