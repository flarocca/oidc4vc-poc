import { promises as fs } from "fs";
import { DidJwk, PortableDid } from "@web5/dids";

export async function getIssuer() {
  try {
    const portableDidData = await fs.readFile("./issuer.json");
    const portableDid: PortableDid = JSON.parse(portableDidData.toString());

    return await DidJwk.import({ portableDid });
  } catch (error) {
    const didJwk = await DidJwk.create({
      options: {
        algorithm: "secp256r1",
      },
    });

    didJwk.document.service = [
      {
        id: `${didJwk.uri}#${
          process.env.ISSUER?.replace("/api", "") as string
        }`,
        type: "LinkedDomains",
        serviceEndpoint: `${process.env.ISSUER?.replace("/api", "") as string}`,
      },
    ];

    const portableDid = await didJwk.export();

    await fs.writeFile("./issuer.json", JSON.stringify(portableDid, null, 4));

    return didJwk;
  }
}
