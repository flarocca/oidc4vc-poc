import { jwtDecode } from "jwt-decode";

const extractClaims = (verifiableCredential: string[]): string[] => {
  let claims: any = {};

  verifiableCredential.forEach((vc) => {
    const cred = jwtDecode<{ sub: string; vc: any; credentialSubject: any }>(
      vc
    );
    const credentialSubject = cred.vc
      ? cred.vc.credentialSubject
      : cred.credentialSubject;

    claims.sub = cred.sub;

    Object.keys(credentialSubject).forEach((key) => {
      claims[key] = credentialSubject[key];
    });
  });

  return claims;
};

export function extractClaimsFromVpToken(vpToken: string): any {
  const payload: {
    vp: { verifiableCredential: string[] };
  } = jwtDecode(vpToken);

  return extractClaims(payload.vp.verifiableCredential);
}
