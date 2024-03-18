import { promises as fs } from "fs";
import jose from "node-jose";

export async function getKeyStore() {
  try {
    const signingKeys = await fs.readFile("./signingKeys.json");

    return await jose.JWK.asKeyStore(signingKeys.toString());
  } catch (error) {
    const keyStore = jose.JWK.createKeyStore();

    await keyStore.generate("EC", "P-256", {
      use: "sig",
      alg: "ES256",
    });

    await keyStore.generate("RSA", 2048, {
      use: "sig",
      alg: "RS256",
    });

    await fs.writeFile(
      "./signingKeys.json",
      JSON.stringify(keyStore.toJSON(true), null, 4)
    );

    return keyStore;
  }
}
