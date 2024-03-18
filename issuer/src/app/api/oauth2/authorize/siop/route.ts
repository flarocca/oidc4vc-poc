import { v4 as uuidv4 } from "uuid";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlow from "@/models/authentication_flow";
import { NextRequest } from "next/server";
import {
  AuthorizationEvents,
  PassBy,
  RP,
  ResponseType,
  RevocationVerification,
  Scope,
  SigningAlgo,
  SubjectType,
  SupportedVersion,
} from "@sphereon/did-auth-siop";
import { getKeyStore } from "@/app/helpers/token";
import events from "events";

const em = new events.EventEmitter();
em.on(AuthorizationEvents.ON_AUTH_REQUEST_CREATED_FAILED, (data) => {
  console.error(
    `Error: ${
      AuthorizationEvents.ON_AUTH_REQUEST_CREATED_FAILED
    }, Details: ${JSON.stringify(data)}`
  );
});

const createSiopUrl = async () => {
  const keyStore = await getKeyStore();
  const [key] = keyStore.all({ use: "sig", kty: "EC" });
  const did = `did:jwk:${Buffer.from(JSON.stringify(key.toJSON())).toString(
    "base64"
  )}`;

  const EXAMPLE_REDIRECT_URL = "https://acme.com/hello";
  const rpKeys = {
    hexPrivateKey:
      "307702010104207c3b4f25e312e40c73f31fc0312dcbd041e160b6d42c877ea4569198ba95e395a00a06082a8648ce3d030107a14403420004e75329e0621a2e37ffd9213d399eaba5bb023dab0b0ea747d97e719ca8a08c0db76d9fdd3a9e43a27fbbc8ddbebc498984d9f0f01df7678be99080f429a5ee05",
    did,
    didKey: `${did}#controller`,
    alg: SigningAlgo.ES256,
  };

  try {
    const rp = RP.builder({
      requestVersion: SupportedVersion.SIOPv2_D12_OID4VP_D18,
    })
      .withRedirectUri(EXAMPLE_REDIRECT_URL)
      .withRequestBy(PassBy.VALUE)
      .withRevocationVerification(RevocationVerification.NEVER)
      .withInternalSignature(
        rpKeys.hexPrivateKey,
        rpKeys.did,
        rpKeys.didKey,
        rpKeys.alg
      )
      .addDidMethod("jwk")
      .withClientMetadata({
        idTokenSigningAlgValuesSupported: [SigningAlgo.ES256],
        requestObjectSigningAlgValuesSupported: [SigningAlgo.ES256],
        responseTypesSupported: [ResponseType.ID_TOKEN],
        vpFormatsSupported: { jwt_vc: { alg: [SigningAlgo.ES256] } },
        scopesSupported: [Scope.OPENID],
        subjectTypesSupported: [SubjectType.PAIRWISE],
        subjectSyntaxTypesSupported: ["did", "did:jwk"],
        passBy: PassBy.VALUE,
      })
      .withPresentationDefinition({
        definition: {
          id: "demo",
          input_descriptors: [
            {
              id: "demo",
              schema: [
                {
                  uri: "https://did.itsourweb.org:3000/smartcredential/Ontario-Health-Insurance-Plan",
                },
              ],
            },
          ],
        },
      })
      .withEventEmitter(em)
      .build();

    console.log(1);

    const authRequest = await rp.createAuthorizationRequest({
      correlationId: "1",
      nonce: "qBrR7mqnY3Qr49dAZycPF8FzgE83m6H0c2l0bzP4xSg",
      state: "b32f0087fc9816eb813fd11f",
    });

    /*
        correlationId: string;
        nonce: string | RequestPropertyWithTargets<string>;
        state: string | RequestPropertyWithTargets<string>;
        claims?: ClaimPayloadCommonOpts | RequestPropertyWithTargets<ClaimPayloadCommonOpts>;
        version?: SupportedVersion;
        requestByReferenceURI?: string;
        responseURI?: string;
        responseURIType?: ResponseURIType;
    */
    console.log(2);

    const uri = await authRequest.uri().then((uri) => uri.encodedUri);

    console.log(3);

    console.log(`Uri: ${uri}`);

    return "uri";
  } catch (error) {
    console.log(JSON.stringify(error));
    throw error;
  }
};

export async function POST(req: NextRequest) {
  await dbConnect();

  const body: { state: string; nonce: string } = await req.json();

  try {
    const auth_flow = await AuthenticationFlow.create({
      type: "siop",
      code: uuidv4(),
      state: body.state,
      nonce: body.nonce,
      status: "initiated",
    });
    const request_uri = encodeURIComponent(
      `${process.env.EXTERNAL_SERVER_URI as string}/api/siop/requests/${
        auth_flow.code
      }`
    );

    const siop_uri = `openid://?request_uri=${request_uri}`;
    // const siop_uri = await createSiopUrl();

    return Response.json({
      success: true,
      data: { ...auth_flow, siop_uri },
    });
  } catch (error) {
    console.log(`Error: ${JSON.stringify(error)}`);
    return Response.json(
      { success: false },
      { status: 400, statusText: "bad_request" }
    );
  }
}
