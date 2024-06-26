# OIDC for Verificable Credentials PoC

## Description

This repository is an example implementation of an OIDC server that also supports OID4VC, OID4VCI and OID4VP.
It implements all the endpoints needed so that ID Wallets can interact with it.

>WARNING!
>This service is not meant to be used in production as it is not implementing the security checks and validations required.
>Use it only for reference and learning purposes

## OIDC Endpoints implemented

These endpoints are mandatory as per OpenID Connect protocol, otherwise clients of this server would not be able to work properly.
All endpoints under `/.well-known` are expected to exist at the domain root and under those specific paths. In other words, clients will request those endpoints at those paths.
Endpoints under `/oauth2` must be present but it is not mandatory to have them strictly under those paths, however it is recommended. Those endpoints are listed at `/.well-known/openid-configuration`.

- `GET  /.well-known/openid-configuration` ([official documentation](https://openid.net/specs/openid-connect-discovery-1_0.html))
<!-- - `GET  /.well-known/did.json` -->
- `GET  /.well-known/did-configuration` ([official documentation](https://identity.foundation/.well-known/resources/did-configuration))
- `GET  /.well-known/openid-credential-issuer` ([official documentation](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-credential-issuer-metadata-).)
- `GET  /oauth2/jwks`
- `POST /oauth2/token`
- `GET  /oauth2/authorize`
- `GET  /oauth2/userinfo`

## Out of protocol endpoints

These set of endpoints are the ones used to exchange Credentials, Verifiable Presentations and Presentation Definitions between the Issuer, the Relaying Party and the User Agent (Wallet App). Additionally, we are including some endpoints needed for Issuer FE to poll status of authentication processes. These endpoints are not normative.

- `GET  /credential-offer/requests/{transactionId}`
- `GET  /credential-offer/status/{transactionId}`
- `GET  /openid-vc/requests/{transactionId}`
- `POST /openid-vc/responses/{transactionId}`
- `GET  /openid-vc/status/{transactionId}`
- `GET  /siop/requests/{transactionId}`
- `POST /siop/responses/{transactionId}`
- `GET  /siop/status/{transactionId}`

### Requests, Responses & Status

**Request** endpoints are used by User Agents (e.g. ID Wallet apps) to request __by reference__ payloads from the Issuer. 
**Response** endpoints are used by User Agents to send payloads to the issuer.
**Status** endpoints are used by Issuer's FE to detect when the current in-progrees flow has completed. This could also be implemented using Web Sockets.

## Instructions

1. Install NodeJS (See instructions [here](https://nodejs.org/en/download))
2. Install MongoDB (See instructions [here](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/))
3. Install dependencies by running `npm install`
4. Run the server by executing `npm run dev`

## TODO list

- [ ] OIDC Authorization Flow compliant
  - [x] Well-Known endpoint
  - [x] JWKs endpoint
  - [x] Authorize endpoint
  - [x] Token endpoint
  - [x] UserInfo endpoint
  - [x] DID Configuration endpoint
  - [x] OIDC Credential Issuer endpoint
  - [ ] Test integration with Cognito
- [x] SIOP flow
- [x] OIDC4VCI
- [x] OIDC4VC
- [x] OIDC4VP
- [ ] Flows
  - [x] Regular Sign Up issuing a VC once email has been verified
  - [x] Sign up with VC without email verification
  - [ ] Sign up with VC with email verification
  - [x] Sign up with KYC

