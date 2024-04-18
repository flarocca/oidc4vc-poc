import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  console.log(`GET /.well-known/openid-credential-issuer`);

  res.status(200).json({
    credential_issuer: `${process.env.EXTERNAL_SERVER_URI as string}`,
    credential_endpoint: `${
      process.env.EXTERNAL_SERVER_URI as string
    }/oauth2/credentials`,
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
            name: "Membership Example",
            description: "Membership Example credential",
            text_color: "#FFFFFF",
            background_image: {
              url: "https://i.ibb.co/kmfrH4F/tulips.png",
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://i.ibb.co/NWQQ9kt/sphereon-logo.png",
              alt_text: "Red square depicting Sphereon logo.",
            },
          },
          {
            locale: "en-US",
            name: "Membership Example",
            description:
              "Sphereon Membership Example credential for demo purposes.",
            text_color: "#FFFFFF",
            background_image: {
              url: "https://i.ibb.co/kmfrH4F/tulips.png",
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://i.ibb.co/NWQQ9kt/sphereon-logo.png",
              alt_text: "Red square depicting Sphereon logo.",
            },
          },
          {
            locale: "es-ES",
            name: "Credencial de ejemplo de Miembro del club",
            description:
              "Credencial de ejemplo de Miembro del club solo apta para demostraciones.",
            text_color: "#FFFFFF",
            background_image: {
              url: "https://i.ibb.co/kmfrH4F/tulips.png",
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://i.ibb.co/NWQQ9kt/sphereon-logo.png",
              alt_text: "Red square depicting Sphereon logo.",
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
        id: "MembershipExample",
        types: ["VerifiableCredential", "MembershipExample"],
        format: "jwt_vc_json",
        cryptographic_binding_methods_supported: ["did:web", "did:jwk"],
        cryptographic_suites_supported: ["ES256", "ES256K", "EdDSA"],
      },
      {
        display: [
          {
            name: "Email Verified",
            description: "Email verified credential",
            text_color: "#000000",
            background_image: {
              url: "https://img.freepik.com/free-vector/watercolour-green-background_78370-1882.jpg",
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
              alt_text: "Red square depicting Sphereon logo.",
            },
          },
          {
            locale: "en-US",
            name: "Email Verified",
            description: "Email verified credential for demo purposes.",
            text_color: "#000000",
            background_image: {
              url: "https://img.freepik.com/free-vector/watercolour-green-background_78370-1882.jpg",
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
              alt_text: "Red square depicting Sphereon logo.",
            },
          },
          {
            locale: "es-ES",
            name: "Email Verificado",
            description:
              "Credencial de prueba de email verificado solo apta para demostraciones.",
            text_color: "#000000",
            background_image: {
              url: "https://img.freepik.com/free-vector/watercolour-green-background_78370-1882.jpg",
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
              alt_text: "Red square depicting Sphereon logo.",
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
        cryptographic_binding_methods_supported: ["did:web", "did:jwk"],
        cryptographic_suites_supported: ["ES256", "ES256K", "EdDSA"],
      },
      {
        display: [
          {
            name: "KYC Credential",
            description: "KYC credential",
            text_color: "#FFFFFF",
            background_image: {
              url: "https://img.freepik.com/foto-gratis/papel-acuarela-amarillo_95678-446.jpg",
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
              alt_text: "Red square depicting Sphereon logo.",
            },
          },
          {
            locale: "en-US",
            name: "KYC Credential",
            description: "KYC credential for demo purposes.",
            text_color: "#FFFFFF",
            background_image: {
              url: "https://img.freepik.com/foto-gratis/papel-acuarela-amarillo_95678-446.jpg",
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
              alt_text: "Red square depicting Sphereon logo.",
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
              alt_text: "Black and white photo of tulips with one red tulip",
            },
            logo: {
              url: "https://images.ctfassets.net/f7s89bi4a9se/6TrUPFQh6LRj1aQq1005PH/1ddba26033479c5e0c3f6488f2704d8e/3.png",
              alt_text: "Red square depicting Sphereon logo.",
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
        cryptographic_binding_methods_supported: ["did:web", "did:jwk"],
        cryptographic_suites_supported: ["ES256", "ES256K", "EdDSA"],
      },
    ],
    credential_supplier_config: {
      templates_base_dir: "templates",
      template_mappings: [
        {
          credential_types: ["MembershipExample"],
          template_path: "MembershipExample.hbs",
          format: "jwt_vc_json",
        },
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
