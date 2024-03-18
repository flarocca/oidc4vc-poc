import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return Response.json({
    credential_issuer: `${process.env.EXTERNAL_SERVER_URI as string}`,
    credential_endpoint: `${
      process.env.EXTERNAL_SERVER_URI as string
    }/credentials`,
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
    ],
    credential_supplier_config: {
      templates_base_dir: "templates/sphereon",
      template_mappings: [
        {
          credential_types: ["MembershipExample"],
          template_path: "MembershipExample.hbs",
          format: "jwt_vc_json",
        },
      ],
    },
  });
}
