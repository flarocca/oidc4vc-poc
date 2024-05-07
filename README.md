# OIDC for Verificable Credentials PoC

## Description

This repository is an example implementation of an OIDC server that also supports OID4VC, OID4VCI and OID4VP.
It implements all the endpoints needed so that ID Wallets can interact with it.

>[!WARNING]<br>
>This service is not meant to be used in production as it is not implementing the security checks and validations required.
>Use it only for reference and learning purposes

## OIDC Endpoints implemented

These endpoints are mandatory as per OpenID Connect protocol, otherwise clients of this server would not be able to work properly.
All endpoints under `/.well-known` are expected to exist at the domain root and under those specific paths. In other words, clients will request those endpoints at those paths.
Endpoints under `/oauth2` must be present but it is not mandatory to have them strictly under those paths, however it is recommended. Those endpoints are listed at `/.well-known/openid-configuration`.

- `GET  /.well-known/openid-configuration`
- `GET  /.well-known/did-configuration`
- `GET  /.well-known/openid-credential-issuer`
- `GET  /oauth2/jwks`
- `POST /oauth2/token`
- `GET  /oauth2/authorize`
- `GET  /oauth2/userinfo`
- `POST /oauth2/credentials`

## Out of protocol endpoints

These set of endpoints are the ones used to exchange Credentials, Verifiable Presentations and Presentation Definitions between the Issuer, the Relaying Party and the User Agent (Wallet App). Additionally, we are including some endpoints needed for Issuer FE to poll status of authentication processes. Some of these endpoints are not normative (e.g. Status endpoints), however some others, while still non-normative, must conform to certain specification. 

- `GET  /credential-offer/requests/{transactionId}`
- `GET  /credential-offer/status/{transactionId}`
- `GET  /openid-vc/requests/{transactionId}`
- `POST /openid-vc/responses/{transactionId}`
- `GET  /openid-vc/status/{transactionId}`
- `GET  /siop/requests/{transactionId}`
- `POST /siop/responses/{transactionId}`
- `GET  /siop/status/{transactionId}`

### Requests, Responses & Status

**Request** endpoints are used by User Agents (e.g. ID Wallet apps) to request __by reference__ payloads from the Issuer. These endpoints must return the corresponding payload as a signed JWT

**Response** endpoints are used by User Agents to send payloads to the issuer.

**Status** endpoints are used by Issuer's FE to detect when the current in-progrees flow has completed. This could also be implemented using Web Sockets.

## Endpoint definition

### `/.well-known/openid-configuration`

This endpoint returns a `JSON` containing all the OIDC information inherent to the Issuer, such as Response Types supported, Signing Algorithms and operational endpoints. User Agents and Relaying Parties will consume this document to know how to interact with the Issuer (e.g. get operational endpoints, validate JTWs, etc)

> [!IMPORTANT]<br>
> This endpoint must be served at the root of the Issuer URI

[official documentation](https://openid.net/specs/openid-connect-discovery-1_0.html)

<details>
<summary>Example Response</summary>

```json
{
  "issuer": "http://localhost:3000/api",
  "credential_isser": "http://localhost:3000/api",
  "authorization_endpoint": "http://localhost:3000/api/oauth2/authorize",
  "token_endpoint": "http://localhost:3000/api/oauth2/token",
  "userinfo_endpoint": "http://localhost:3000/api/oauth2/userinfo",
  "credential_endpoint": "http://localhost:3000/api/oauth2/credentials",
  "jwks_uri": "http://localhost:3000/api/oauth2/jwks",
  "credential_issuer_uri": "http://localhost:3000/api/.well-known/openid-credential-issuer",
  "id_token_signing_alg_values_supported": ["RS256"],
  "request_object_signing_alg_values_supported": ["ES256"],
  "response_types_supported": ["code", "id_token", "vp_token"],
  "scopes_supported": ["openid", "email", "profile"/*, "did_authn"*/],
  "subject_types_supported": ["pairwise"],
  "subject_syntax_types_supported": ["did:jwk"],
  "claims_supported": [
    "sub",
    "exp",
    "iat",
    "iss",
    "email",
    "given_name",
    "family_name"
  ]
}
```

</details>

### `/.well-known/did-configuration`

This endpoint returns the linked DIDs associated with this Issuer. If Linked domains are listed as part of each DID, this endpoint can serve as a proof of domain and DID ownership. Linked DIDs can be in the form of JWKs or in the form of JSON_LD.

> [!IMPORTANT]<br>
> This endpoint must be served at the root of the Issuer URI

[official documentation](https://identity.foundation/.well-known/resources/did-configuration)

<details>
<summary>Example Response</summary>

```json
{
  "@context": "https://identity.foundation/.well-known/did-configuration/v1",
  "linked_dids": [
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SWxBdE1qVTJJaXdpZUNJNklucDFPR3RMYWpSbFFVWTRTbGQ0TWxSMGN6TllVM1JaZGtWdVVXcHhTMlZrTVMwellrZElZV3QwTTBFaUxDSjVJam9pVkZnMmRGTkdlREIwWVdGNGVHcHZialV4WkRCUllXZ3RkbEF0V25SSU9GZHJWSFp3U0Y5dmVFNW5aeUlzSW10cFpDSTZJazVMZGpSWVFVUmtUVXhpZHpOdlFrcGpSRGRLWDJoTWRIYzJkV05yUVU0dE9YTTVhMUEyWkZsaFYxRWlMQ0poYkdjaU9pSkZVekkxTmlKOSMwIn0.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRG9tYWluTGlua2FnZUNyZWRlbnRpYWwiXSwiaWQiOiJ1cm46dXVpZDo2YzgzYTg0MS1kYWI4LTRkMGMtYWVlMi1jNDdlZTk3ZDM3ZGUiLCJpc3N1ZXIiOiJkaWQ6andrOmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJbnAxT0d0TGFqUmxRVVk0U2xkNE1sUjBjek5ZVTNSWmRrVnVVV3B4UzJWa01TMHpZa2RJWVd0ME0wRWlMQ0o1SWpvaVZGZzJkRk5HZURCMFlXRjRlR3B2YmpVeFpEQlJZV2d0ZGxBdFduUklPRmRyVkhad1NGOXZlRTVuWnlJc0ltdHBaQ0k2SWs1TGRqUllRVVJrVFV4aWR6TnZRa3BqUkRkS1gyaE1kSGMyZFdOclFVNHRPWE01YTFBMlpGbGhWMUVpTENKaGJHY2lPaUpGVXpJMU5pSjkiLCJpc3N1YW5jZURhdGUiOiIyMDI0LTA1LTA2VDE3OjUyOjI4WiIsImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImlkIjoiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5wMU9HdExhalJsUVVZNFNsZDRNbFIwY3pOWVUzUlpka1Z1VVdweFMyVmtNUzB6WWtkSVlXdDBNMEVpTENKNUlqb2lWRmcyZEZOR2VEQjBZV0Y0ZUdwdmJqVXhaREJSWVdndGRsQXRXblJJT0ZkclZIWndTRjl2ZUU1blp5SXNJbXRwWkNJNklrNUxkalJZUVVSa1RVeGlkek52UWtwalJEZEtYMmhNZEhjMmRXTnJRVTR0T1hNNWExQTJaRmxoVjFFaUxDSmhiR2NpT2lKRlV6STFOaUo5Iiwib3JpZ2luIjoiaHR0cDovL2xvY2FsaG9zdDozMDAwIn0sImV4cGlyYXRpb25EYXRlIjoiMjAyNC0wNS0wNlQxODoxMjoyOC42MDJaIn0sIm5iZiI6MTcxNTAxNzk0OCwianRpIjoidXJuOnV1aWQ6NmM4M2E4NDEtZGFiOC00ZDBjLWFlZTItYzQ3ZWU5N2QzN2RlIiwiaXNzIjoiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5wMU9HdExhalJsUVVZNFNsZDRNbFIwY3pOWVUzUlpka1Z1VVdweFMyVmtNUzB6WWtkSVlXdDBNMEVpTENKNUlqb2lWRmcyZEZOR2VEQjBZV0Y0ZUdwdmJqVXhaREJSWVdndGRsQXRXblJJT0ZkclZIWndTRjl2ZUU1blp5SXNJbXRwWkNJNklrNUxkalJZUVVSa1RVeGlkek52UWtwalJEZEtYMmhNZEhjMmRXTnJRVTR0T1hNNWExQTJaRmxoVjFFaUxDSmhiR2NpT2lKRlV6STFOaUo5Iiwic3ViIjoiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5wMU9HdExhalJsUVVZNFNsZDRNbFIwY3pOWVUzUlpka1Z1VVdweFMyVmtNUzB6WWtkSVlXdDBNMEVpTENKNUlqb2lWRmcyZEZOR2VEQjBZV0Y0ZUdwdmJqVXhaREJSWVdndGRsQXRXblJJT0ZkclZIWndTRjl2ZUU1blp5SXNJbXRwWkNJNklrNUxkalJZUVVSa1RVeGlkek52UWtwalJEZEtYMmhNZEhjMmRXTnJRVTR0T1hNNWExQTJaRmxoVjFFaUxDSmhiR2NpT2lKRlV6STFOaUo5IiwiaWF0IjoxNzE1MDE3OTQ4LCJleHAiOjE3MTUwMTkxNDh9.jpiBVFzpGS_M6Fjs-_E2kMDguyCDZsMmL4yKaQRv3KbjxUwN7LK_X7QwQJT-ixgUsJ2-HXlju2i8FbG0J83yvA"
  ]
}
```

</details>

### `/.well-known/openid-credential-issuer`

This endpoint lists all the information required by User Agents to Exchange credentials, including wordings, styles, images and information each credential includes.

> [!IMPORTANT]<br>
> This endpoint must be served at the root of the Issuer URI

[official documentation](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html#name-credential-issuer-metadata-)

<details>
<summary>Example Response</summary>

```json
{
  "credential_issuer": "http://localhost:3000/api",
  "credential_endpoint": "http://localhost:3000/api/oauth2/credentials",
  "token_endpoint": "http://localhost:3000/api/oauth2/token",
  "display": [
    {
      "name": "Demo Issuer",
      "description": "Demo Issuer"
    }
  ],
  "credentials_supported": [
    {
      "display": [
        {
          "name": "Email Verified",
          "description": "Email verified credential",
          "text_color": "#000000",
          "background_image": {
            "url": "http://localhost:3000/templates/emailVerified/background.jpg",
            "alt_text": "Empty"
          },
          "logo": {
            "url": "http://localhost:3000/templates/emailVerified/logo.png",
            "alt_text": "Empty"
          }
        },
        {
          "locale": "en-US",
          "name": "Email Verified",
          "description": "Email verified credential",
          "text_color": "#000000",
          "background_image": {
            "url": "http://localhost:3000/templates/emailVerified/background.jpg",
            "alt_text": "Empty"
          },
          "logo": {
            "url": "http://localhost:3000/templates/emailVerified/logo.png",
            "alt_text": "Empty"
          }
        },
        {
          "locale": "es-ES",
          "name": "Email Verificado",
          "description": "Credencial de email verificado",
          "text_color": "#000000",
          "background_image": {
            "url": "http://localhost:3000/templates/emailVerified/background.jpg",
            "alt_text": "Empty"
          },
          "logo": {
            "url": "http://localhost:3000/templates/emailVerified/logo.png",
            "alt_text": "Empty"
          }
        }
      ],
      "order": [
        "email"
      ],
      "credentialSubject": {
        "email": {
          "value_type": "string",
          "display": [
            {
              "name": "Email"
            },
            {
              "name": "Email",
              "locale": "en-US"
            },
            {
              "name": "Email",
              "locale": "es-ES"
            }
          ]
        }
      },
      "id": "EmailVerifiedCredential",
      "types": [
        "VerifiableCredential",
        "EmailVerifiedCredential"
      ],
      "format": "jwt_vc_json",
      "cryptographic_binding_methods_supported": [
        "did:jwk"
      ],
      "cryptographic_suites_supported": [
        "ES256"
      ]
    },
    {
      "display": [
        {
          "name": "KYC",
          "description": "KYC credential",
          "text_color": "#FFFFFF",
          "background_image": {
            "url": "http://localhost:3000/templates/kyc/background.jpg",
            "alt_text": "Empty"
          },
          "logo": {
            "url": "http://localhost:3000/templates/kyc/logo.png",
            "alt_text": "Empty"
          }
        },
        {
          "locale": "en-US",
          "name": "KYC",
          "description": "KYC credential",
          "text_color": "#FFFFFF",
          "background_image": {
            "url": "http://localhost:3000/templates/kyc/background.jpg",
            "alt_text": "Empty"
          },
          "logo": {
            "url": "http://localhost:3000/templates/kyc/logo.png",
            "alt_text": "Empty"
          }
        },
        {
          "locale": "es-ES",
          "name": "KYC",
          "description": "Credencial de KYC",
          "text_color": "#FFFFFF",
          "background_image": {
            "url": "http://localhost:3000/templates/kyc/background.jpg",
            "alt_text": "Empty"
          },
          "logo": {
            "url": "http://localhost:3000/templates/kyc/logo.png",
            "alt_text": "Empty"
          }
        }
      ],
      "order": [
        "firstName",
        "lastName",
        "email"
      ],
      "credentialSubject": {
        "firstName": {
          "value_type": "string",
          "display": [
            {
              "name": "First Name"
            },
            {
              "name": "First Name",
              "locale": "en-US"
            },
            {
              "name": "Nombre",
              "locale": "es-ES"
            }
          ]
        },
        "lastName": {
          "value_type": "string",
          "display": [
            {
              "name": "Last Name"
            },
            {
              "name": "Last Name",
              "locale": "en-US"
            },
            {
              "name": "Apellido",
              "locale": "es-ES"
            }
          ]
        },
        "email": {
          "value_type": "string",
          "display": [
            {
              "name": "Email"
            },
            {
              "name": "Email",
              "locale": "en-US"
            },
            {
              "name": "Email",
              "locale": "es-ES"
            }
          ]
        }
      },
      "id": "KycCredential",
      "types": [
        "VerifiableCredential",
        "KycCredential"
      ],
      "format": "jwt_vc_json",
      "cryptographic_binding_methods_supported": [
        "did:jwk"
      ],
      "cryptographic_suites_supported": [
        "ES256"
      ]
    }
  ],
  "credential_supplier_config": {
    "templates_base_dir": "templates",
    "template_mappings": [
      {
        "credential_types": [
          "EmailVerifiedCredential"
        ],
        "template_path": "emailVerified/EmailVerifiedCredential.hbs",
        "format": "jwt_vc_json"
      },
      {
        "credential_types": [
          "KycCredential"
        ],
        "template_path": "kyc/KycCredential.hbs",
        "format": "jwt_vc_json"
      }
    ]
  }
}
```
</details>

### `/oauth2/jwks`

This endpoint lists the Public component of all JSON Web Keys used to sign JWTs. This endpoint is used by User Agents and Relaying Parties to validate JWTs are valid and signed by this Issuer

<details>
<summary>Example Response</summary>

```json
{
  "keys": [
    {
      "kty": "EC",
      "kid": "NKv4XADdMLbw3oBJcD7J_hLtw6uckAN-9s9kP6dYaWQ",
      "alg": "ES256",
      "crv": "P-256",
      "x": "zu8kKj4eAF8JWx2Tts3XStYvEnQjqKed1-3bGHakt3A",
      "y": "TX6tSFx0taaxxjon51d0Qah-vP-ZtH8WkTvpH_oxNgg"
    },
    {
      "kty": "RSA",
      "kid": "cuapD5u_7fjXJWm-hf0a5j2OXyYn4KRkFew1T97zcZo",
      "use": "sig",
      "alg": "RS256",
      "e": "AQAB",
      "n": "xKyZJdZ3IMCvYYVxeptwlc7cnLUQCmywQLFszQWeS3Df9GL39H8EgHq3JBsYi9UUz3jxGvkoU2EP_eQAd7_3iAKu4Zxjd0X0jiN1WMEDY6lIbgCbTHE29vh39tM9hC0KAXgXRplIjN9OLoAFHKNuiKeyV4DzrIOFjpzP9ag76cEQxEKMs1Wb-P3fCSEJyoboQ-hjMXm2UyFkueSdtCdLju_CBRmNufTf2wSRWjvH8Jdy6uyD8L_5EbPEZ1fXseSbQ4ZhldxdnC8S4t_CaBJJ_RFxkBKQnWIoF-NobFceHGqqIdtBP-WndmThOp1B33cQoCfkjfGoje7hnyxOQGPLUQ"
    }
  ]
}
```
</details>

### `/oauth2/token`

This endpoint is used by User Agents and Relaying parties to exchange `codes` and `pre-authorized_codes` by `access_tokens`.

<details>
<summary>Authorization Code request & response example</summary>

```curl
curl --location 'http://localhost:3000/api/oauth2/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id={client_id}' \
--data-urlencode 'client_secret={client_secret}' \
--data-urlencode 'grant_type=authorization_code' \
--data-urlencode 'redirect_uri={whitelisted_redirect_uri}' \
--data-urlencode 'code={auth_code}'

```
```json
{
    "access_token": "{header}.{claims}.{signature}",
    "id_token": "{header}.{claims}.{signature}",
    "token_type": "bearer",
    "expires_in": 300
}
```
</details>

<details>
<summary>Pre-Authorized Code request & response example</summary>

```curl
curl --location 'http://localhost:3000/api/oauth2/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id={subject_did}' \
--data-urlencode 'grant_type=urn:ietf:params:oauth:grant-type:pre-authorized_code' \
--data-urlencode 'pre-authorized_code={auth_code}'

```
```json
{
    "access_token": "{header}.{claims}.{signature}",
    "id_token": "{header}.{claims}.{signature}",
    "token_type": "bearer",
    "expires_in": 300
}
```
</details>

### `/oauth2/authorize`

This is the entrypoint to the IDP and it is meant to be used from the browser, it returns HTML.

### `/oauth2/userinfo`

The User Info endpoint returns user's claims. It uses Bearer tokens to authenticate and authorize the request

<details>
<summary>Example request & response</summary>

```curl
curl --location 'http://localhost:3000/api/oauth2/userinfo' \
--header 'Authorization: Bearer {access_token}'
```
```json
{
    "sub": "3b9e2ba6-12a2-42de-85d7-b66c14ca37f2",
    "iss": "http://localhost:3000/api",
    "iat": 1715101373,
    "exp": 1715102573,
    "nonce": "nonce-bae545ac-894d-440e-842f-bb5b9e330f5b",
    "email": "email@example.io",
    "given_name": "User",
    "family_name": "Cool",
    "email_verified": false,
    "kyc_complete": false
}
```
</details>

### `/oauth2/credentials`

This endpoint is used by User Agents to claim issued credentials. It requires a Bearer token obtained via a `pre-authorized_code` (See credential offer request endpoint). In the request body there must be sent the credential type being requested as well as a proof. This proof is a JWT that contains the issuer in the form of the DID that signed the JWT.

This endpoint returns the credentials in the form of a JWT

<details>
<summary>Example request & response</summary>

```curl
curl --location 'http://localhost:3000/api/oauth2/credentials' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer {access_token}' \
--data '{
      "types": [
          "VerifiableCredential",
          "EmailVerifiedCredential"
      ],
      "format": "jwt_vc_json",
      "proof": {
          "proof_type": "jwt",
          "jwt": "eyJ0eXAiOiJvcGVuaWQ0dmNpLXByb29mK2p3dCIsImFsZyI6IkVTMjU2Iiwia2lkIjoiZGlkOmp3azpleUpoYkdjaU9pSkZVekkxTmlJc0luVnpaU0k2SW5OcFp5SXNJbXQwZVNJNklrVkRJaXdpWTNKMklqb2lVQzB5TlRZaUxDSjRJam9pTjFaZlpuZFBNR2RoU1ZSWWEwWjZaR2hOYm1OMmJGcFNSekUzV0VKTGMwWXdjakJHY2tnNE1EUldheUlzSW5raU9pSTBUMGwxTFZoeGRFTm5NREp6V1VoRVptNXFlRWhKTVhKMmFVMW1lVTFpVUd0UFZ6RTRhVTVGUjNWTkluMCMwIn0.eyJpYXQiOjE3MTUwMDczODYsImV4cCI6MTcxNTAwODA0NiwiYXVkIjoiaHR0cHM6Ly9vaWRjLXBvYy5zYW5kYm94LmFjY291bnRzLmZvcnRlLmlvLy9hcGkiLCJub25jZSI6IjQ0N2ZmNmRhLTkxN2MtNDBjMi1hNjhhLWU0YzE3YWZmZDJhNiIsImlzcyI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5pSXNJblZ6WlNJNkluTnBaeUlzSW10MGVTSTZJa1ZESWl3aVkzSjJJam9pVUMweU5UWWlMQ0o0SWpvaU4xWmZabmRQTUdkaFNWUllhMFo2WkdoTmJtTjJiRnBTUnpFM1dFSkxjMFl3Y2pCR2NrZzRNRFJXYXlJc0lua2lPaUkwVDBsMUxWaHhkRU5uTURKeldVaEVabTVxZUVoSk1YSjJhVTFtZVUxaVVHdFBWekU0YVU1RlIzVk5JbjAiLCJqdGkiOiI4ZjFlYzMyMy1kOGM0LTRkMzUtOTdiNy0wZjE3ZWEwYmQ3M2EifQ.MkRicxbFtbabJCS08NXdlE9tuwyQnqKXqXbujEcjjkjSB5zxjq5lKHwgpN5QZlDGETRBTSdUrhKj1hKI8t1QgA"
      }
  }'
```
```json
{
    "format": "jwt_vc",
    "credential": "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SWxBdE1qVTJJaXdpZUNJNklucDFPR3RMYWpSbFFVWTRTbGQ0TWxSMGN6TllVM1JaZGtWdVVXcHhTMlZrTVMwellrZElZV3QwTTBFaUxDSjVJam9pVkZnMmRGTkdlREIwWVdGNGVHcHZialV4WkRCUllXZ3RkbEF0V25SSU9GZHJWSFp3U0Y5dmVFNW5aeUlzSW10cFpDSTZJazVMZGpSWVFVUmtUVXhpZHpOdlFrcGpSRGRLWDJoTWRIYzJkV05yUVU0dE9YTTVhMUEyWkZsaFYxRWlMQ0poYkdjaU9pSkZVekkxTmlKOSMwIn0.eyJ2YyI6eyJAY29udGV4dCI6WyJodHRwczovL3d3dy53My5vcmcvMjAxOC9jcmVkZW50aWFscy92MSJdLCJ0eXBlIjpbIlZlcmlmaWFibGVDcmVkZW50aWFsIiwiRW1haWxWZXJpZmllZENyZWRlbnRpYWwiXSwiaWQiOiJ1cm46dXVpZDpmZDVhZjQ5Ny0zZjQ1LTQ0MGYtYTI0Yy02YmNkY2RiMWQyN2YiLCJpc3N1ZXIiOiJkaWQ6andrOmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJbnAxT0d0TGFqUmxRVVk0U2xkNE1sUjBjek5ZVTNSWmRrVnVVV3B4UzJWa01TMHpZa2RJWVd0ME0wRWlMQ0o1SWpvaVZGZzJkRk5HZURCMFlXRjRlR3B2YmpVeFpEQlJZV2d0ZGxBdFduUklPRmRyVkhad1NGOXZlRTVuWnlJc0ltdHBaQ0k2SWs1TGRqUllRVVJrVFV4aWR6TnZRa3BqUkRkS1gyaE1kSGMyZFdOclFVNHRPWE01YTFBMlpGbGhWMUVpTENKaGJHY2lPaUpGVXpJMU5pSjkiLCJpc3N1YW5jZURhdGUiOiIyMDI0LTA1LTA3VDE3OjI2OjA0Ljc5NloiLCJjcmVkZW50aWFsU3ViamVjdCI6eyJpZCI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5pSXNJblZ6WlNJNkluTnBaeUlzSW10MGVTSTZJa1ZESWl3aVkzSjJJam9pVUMweU5UWWlMQ0o0SWpvaU4xWmZabmRQTUdkaFNWUllhMFo2WkdoTmJtTjJiRnBTUnpFM1dFSkxjMFl3Y2pCR2NrZzRNRFJXYXlJc0lua2lPaUkwVDBsMUxWaHhkRU5uTURKeldVaEVabTVxZUVoSk1YSjJhVTFtZVUxaVVHdFBWekU0YVU1RlIzVk5JbjAiLCJlbWFpbCI6ImZhY3UubGFyb2NjYUBnbWFpbC5jb20ifSwiZXhwaXJhdGlvbkRhdGUiOiIyMDI1LTA1LTA3VDE3OjI2OjA0Ljc5NloifSwibmJmIjoxNzE1MTAyNzY0LCJqdGkiOiJ1cm46dXVpZDpmZDVhZjQ5Ny0zZjQ1LTQ0MGYtYTI0Yy02YmNkY2RiMWQyN2YiLCJpc3MiOiJkaWQ6andrOmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJbnAxT0d0TGFqUmxRVVk0U2xkNE1sUjBjek5ZVTNSWmRrVnVVV3B4UzJWa01TMHpZa2RJWVd0ME0wRWlMQ0o1SWpvaVZGZzJkRk5HZURCMFlXRjRlR3B2YmpVeFpEQlJZV2d0ZGxBdFduUklPRmRyVkhad1NGOXZlRTVuWnlJc0ltdHBaQ0k2SWs1TGRqUllRVVJrVFV4aWR6TnZRa3BqUkRkS1gyaE1kSGMyZFdOclFVNHRPWE01YTFBMlpGbGhWMUVpTENKaGJHY2lPaUpGVXpJMU5pSjkiLCJzdWIiOiJkaWQ6andrOmV5SmhiR2NpT2lKRlV6STFOaUlzSW5WelpTSTZJbk5wWnlJc0ltdDBlU0k2SWtWRElpd2lZM0oySWpvaVVDMHlOVFlpTENKNElqb2lOMVpmWm5kUE1HZGhTVlJZYTBaNlpHaE5ibU4yYkZwU1J6RTNXRUpMYzBZd2NqQkdja2c0TURSV2F5SXNJbmtpT2lJMFQwbDFMVmh4ZEVObk1ESnpXVWhFWm01cWVFaEpNWEoyYVUxbWVVMWlVR3RQVnpFNGFVNUZSM1ZOSW4wIiwiaWF0IjoxNzE1MTAyNzY0LCJleHAiOjE3NDY2Mzg3NjR9.cy-PkcZTuamKVqOgZUyh8Qf1dqRL5rlV9l7XVeNM8ASL6R_ZVE1sSrebJ65r2AIiYriZVpw0bsuvhmWtnXOPyg",
    "c_nonce": "447ff6da-917c-40c2-a68a-e4c17affd2a6",
    "c_nonce_expires_in": 86400
}
```
</details>


## Instructions

1. Install NodeJS (See instructions [here](https://nodejs.org/en/download))
2. Install MongoDB (See instructions [here](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-os-x/))
3. Install dependencies by running `npm install`
4. Make a copy of the environment file `.env.example` and rename it to `.env.local`, then replace the values with the actual MongoDB instance and the corresponding local server URIs (for default local development environments, the actual file can just be renamed)
5. Run the server by executing `npm run dev`
6. From your browser, navigate to `http://localhost:3000`
