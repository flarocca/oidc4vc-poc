import { createSignedPresentationDefinition } from "@/helpers/verifiableCredentials";
import dbConnect from "@/lib/dbConnect";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  await dbConnect();

  const { txid } = req.query;

  console.log(
    `[OIDC Operational] GET /api/openid-vc/requests/${txid} - Scanned`
  );

  try {
    const authFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "openid-vc",
        code: txid,
      },
      {
        status: "scanned",
      }
    ).exec();

    console.log(
      `[OIDC Operational] GET /api/openid-vc/requests/${txid} - Found`
    );

    const signedPresentationDefinition =
      await createSignedPresentationDefinition({
        redirectUri: `${
          process.env.ISSUER as string
        }/openid-vc/responses/${txid}`,
        nonce: authFlow.nonce,
        state: authFlow.state,
        requirePii: authFlow.data.requirePii,
        requireEmailVerified: authFlow.data.requireEmailVerified,
        requireKyc: authFlow.data.requireKyc,
      });

    console.log(
      `[OIDC Operational] GET /api/openid-vc/requests/${txid} - Complete ${signedPresentationDefinition}.`
    );

    res.status(200).end(signedPresentationDefinition);
  } catch (error) {
    console.error(
      `[OIDC Operational] GET /api/openid-vc/requests/${txid} - Error: ${JSON.stringify(
        error
      )}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}

/*
Response
  eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SWxBdE1qVTJJaXdpZUNJNklucDFPR3RMYWpSbFFVWTRTbGQ0TWxSMGN6TllVM1JaZGtWdVVXcHhTMlZrTVMwellrZElZV3QwTTBFaUxDSjVJam9pVkZnMmRGTkdlREIwWVdGNGVHcHZialV4WkRCUllXZ3RkbEF0V25SSU9GZHJWSFp3U0Y5dmVFNW5aeUlzSW10cFpDSTZJazVMZGpSWVFVUmtUVXhpZHpOdlFrcGpSRGRLWDJoTWRIYzJkV05yUVU0dE9YTTVhMUEyWkZsaFYxRWlMQ0poYkdjaU9pSkZVekkxTmlKOSMwIn0.eyJpYXQiOjE3MTUwMTA2NjksIm5iZiI6MTcxNTAxMDY2OSwiZXhwIjoxNzE1MDExODY5LCJqdGkiOiJlYThjNmNlYS02NTAxLTQ4MmQtOTQyZS1iNTYyZWMyNzliZWQiLCJyZXNwb25zZV9tb2RlIjoicG9zdCIsInJlc3BvbnNlX3R5cGUiOiJ2cF90b2tlbiIsInNjb3BlIjoib3BlbmlkIiwiY2xpZW50X2lkIjoiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5wMU9HdExhalJsUVVZNFNsZDRNbFIwY3pOWVUzUlpka1Z1VVdweFMyVmtNUzB6WWtkSVlXdDBNMEVpTENKNUlqb2lWRmcyZEZOR2VEQjBZV0Y0ZUdwdmJqVXhaREJSWVdndGRsQXRXblJJT0ZkclZIWndTRjl2ZUU1blp5SXNJbXRwWkNJNklrNUxkalJZUVVSa1RVeGlkek52UWtwalJEZEtYMmhNZEhjMmRXTnJRVTR0T1hNNWExQTJaRmxoVjFFaUxDSmhiR2NpT2lKRlV6STFOaUo5IiwiaXNzIjoiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5wMU9HdExhalJsUVVZNFNsZDRNbFIwY3pOWVUzUlpka1Z1VVdweFMyVmtNUzB6WWtkSVlXdDBNMEVpTENKNUlqb2lWRmcyZEZOR2VEQjBZV0Y0ZUdwdmJqVXhaREJSWVdndGRsQXRXblJJT0ZkclZIWndTRjl2ZUU1blp5SXNJbXRwWkNJNklrNUxkalJZUVVSa1RVeGlkek52UWtwalJEZEtYMmhNZEhjMmRXTnJRVTR0T1hNNWExQTJaRmxoVjFFaUxDSmhiR2NpT2lKRlV6STFOaUo5Iiwic3ViIjoiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5wMU9HdExhalJsUVVZNFNsZDRNbFIwY3pOWVUzUlpka1Z1VVdweFMyVmtNUzB6WWtkSVlXdDBNMEVpTENKNUlqb2lWRmcyZEZOR2VEQjBZV0Y0ZUdwdmJqVXhaREJSWVdndGRsQXRXblJJT0ZkclZIWndTRjl2ZUU1blp5SXNJbXRwWkNJNklrNUxkalJZUVVSa1RVeGlkek52UWtwalJEZEtYMmhNZEhjMmRXTnJRVTR0T1hNNWExQTJaRmxoVjFFaUxDSmhiR2NpT2lKRlV6STFOaUo5IiwicmVkaXJlY3RfdXJpIjoiaHR0cHM6Ly9vaWRjLXBvYy5zYW5kYm94LmFjY291bnRzLmZvcnRlLmlvLy9hcGkvb3BlbmlkLXZjL3Jlc3BvbnNlcy8yZDg5Nzc0Mi00MTA4LTQ2ZmMtYmI5OC04NDQ4MTE1NmFiY2EiLCJub25jZSI6IjNmNTgyZDcwLWIyNmUtNGQxYS04Mzk2LWM0OTYxOGYzNTM5NCIsInN0YXRlIjoiMjcwMDdlMmUtNzY5NC00YWJhLWFlNGEtOWFhZWE0NzRhZWQ2IiwicmVnaXN0cmF0aW9uIjp7ImlkX3Rva2VuX3NpZ25pbmdfYWxnX3ZhbHVlc19zdXBwb3J0ZWQiOlsiRWREU0EiLCJFUzI1NiIsIkVTMjU2SyJdLCJyZXF1ZXN0X29iamVjdF9zaWduaW5nX2FsZ192YWx1ZXNfc3VwcG9ydGVkIjpbIkVkRFNBIiwiRVMyNTYiLCJFUzI1NksiXSwicmVzcG9uc2VfdHlwZXNfc3VwcG9ydGVkIjpbImlkX3Rva2VuIiwidnBfdG9rZW4iXSwic2NvcGVzX3N1cHBvcnRlZCI6WyJvcGVuaWQgZGlkX2F1dGhuIl0sInN1YmplY3RfdHlwZXNfc3VwcG9ydGVkIjpbInBhaXJ3aXNlIl0sInN1YmplY3Rfc3ludGF4X3R5cGVzX3N1cHBvcnRlZCI6WyJkaWQ6a2V5IiwiZGlkOmp3ayJdLCJ2cF9mb3JtYXRzIjp7Imp3dF92YyI6eyJhbGciOlsiRWREU0EiLCJFUzI1NiIsIkVTMjU2SyJdfSwiand0X3ZwIjp7ImFsZyI6WyJFZERTQSIsIkVTMjU2IiwiRVMyNTZLIl19fX0sImNsYWltcyI6eyJ2cF90b2tlbiI6eyJwcmVzZW50YXRpb25fZGVmaW5pdGlvbiI6eyJpZCI6ImF1dGhuLXdpdGgtdmMiLCJwdXJwb3NlIjoiQXV0aGVudGljYXRpb24gdXNpbmcgVkNzIiwiaW5wdXRfZGVzY3JpcHRvcnMiOlt7ImlkIjoib25seS1lbWFpbCIsIm5hbWUiOiJNdXN0IGluY2x1ZGUgb25seSBlbWFpbCIsInB1cnBvc2UiOiJBdXRoZW50aWNhdGUgeW91IHVzaW5nIHVzaW5nIG9ubHkgZW1haWwiLCJjb25zdHJhaW50cyI6eyJmaWVsZHMiOlt7InBhdGgiOlsiJC5jcmVkZW50aWFsU3ViamVjdC5lbWFpbCIsIiQudmMuY3JlZGVudGlhbFN1YmplY3QuZW1haWwiLCIkLmNyZWRlbnRpYWxTdWJqZWN0LmVtYWlsQWRkcmVzcyIsIiQudmMuY3JlZGVudGlhbFN1YmplY3QuZW1haWxBZGRyZXNzIl19XX19XX19fX0._o_IvMJ-2yroObbDG-eKmC5IidOmJWThuMu1HA0z5uhpWk2aPSg8YMZV1AJLJrzZzNk2Bq8mTl5AWmh_0kACMA
*/
