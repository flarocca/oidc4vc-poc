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

  console.log(`[OIDC Operational] GET /api/siop/requests/${txid} - Initiated`);

  try {
    const authFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "siop",
        code: txid,
      },
      {
        status: "scanned",
      }
    ).exec();

    const signedPresentationDefinition =
      await createSignedPresentationDefinition({
        redirectUri: `${process.env.ISSUER as string}/siop/responses/${txid}`,
        nonce: authFlow.nonce,
        state: authFlow.state,
        requirePii: false,
        requireEmailVerified: false,
        requireKyc: false,
      });

    console.log(
      `[OIDC Operational] GET /api/siop/requests/${txid} - Complete: ${signedPresentationDefinition}`
    );

    res.status(200).end(signedPresentationDefinition);
  } catch (error) {
    console.error(
      `[OIDC Operational] GET /api/siop/requests/${txid} - Error: ${JSON.stringify(
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
  eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SWxBdE1qVTJJaXdpZUNJNklucDFPR3RMYWpSbFFVWTRTbGQ0TWxSMGN6TllVM1JaZGtWdVVXcHhTMlZrTVMwellrZElZV3QwTTBFaUxDSjVJam9pVkZnMmRGTkdlREIwWVdGNGVHcHZialV4WkRCUllXZ3RkbEF0V25SSU9GZHJWSFp3U0Y5dmVFNW5aeUlzSW10cFpDSTZJazVMZGpSWVFVUmtUVXhpZHpOdlFrcGpSRGRLWDJoTWRIYzJkV05yUVU0dE9YTTVhMUEyWkZsaFYxRWlMQ0poYkdjaU9pSkZVekkxTmlKOSMwIn0.eyJpYXQiOjE3MTUwMTA4MjgsImV4cCI6MTcxNTAxMjAyOCwicmVzcG9uc2VfdHlwZSI6InZwX3Rva2VuIiwic2NvcGUiOiJvcGVuaWQiLCJjbGllbnRfaWQiOiJkaWQ6andrOmV5SnJkSGtpT2lKRlF5SXNJbU55ZGlJNklsQXRNalUySWl3aWVDSTZJbnAxT0d0TGFqUmxRVVk0U2xkNE1sUjBjek5ZVTNSWmRrVnVVV3B4UzJWa01TMHpZa2RJWVd0ME0wRWlMQ0o1SWpvaVZGZzJkRk5HZURCMFlXRjRlR3B2YmpVeFpEQlJZV2d0ZGxBdFduUklPRmRyVkhad1NGOXZlRTVuWnlJc0ltdHBaQ0k2SWs1TGRqUllRVVJrVFV4aWR6TnZRa3BqUkRkS1gyaE1kSGMyZFdOclFVNHRPWE01YTFBMlpGbGhWMUVpTENKaGJHY2lPaUpGVXpJMU5pSjkiLCJyZXNwb25zZV91cmkiOiJodHRwczovL29pZGMtcG9jLnNhbmRib3guYWNjb3VudHMuZm9ydGUuaW8vL2FwaS9zaW9wL3Jlc3BvbnNlcy9iOGJmMjNmOS1hN2E3LTQxMjgtYTczNC0zNWFhNzQzNjI5ZTgiLCJyZXNwb25zZV9tb2RlIjoiZGlyZWN0X3Bvc3QiLCJub25jZSI6ImIyYzhhMDI1LTYwYWItNDI1Zi1hZTcyLTczMGY3YjA5M2QxNiIsInN0YXRlIjoiNWZhNTIwZGEtYzc1YS00ZmQ1LTg3YTctMzNjOTA5NDdiNjk2IiwiY2xpZW50X21ldGFkYXRhIjp7ImlkX3Rva2VuX3NpZ25pbmdfYWxnX3ZhbHVlc19zdXBwb3J0ZWQiOlsiRVMyNTYiXSwicmVxdWVzdF9vYmplY3Rfc2lnbmluZ19hbGdfdmFsdWVzX3N1cHBvcnRlZCI6WyJFUzI1NiJdLCJyZXNwb25zZV90eXBlc19zdXBwb3J0ZWQiOlsiaWRfdG9rZW4iLCJ2cF90b2tlbiJdLCJzY29wZXNfc3VwcG9ydGVkIjpbIm9wZW5pZCBkaWRfYXV0aG4iXSwic3ViamVjdF90eXBlc19zdXBwb3J0ZWQiOlsicGFpcndpc2UiXSwic3ViamVjdF9zeW50YXhfdHlwZXNfc3VwcG9ydGVkIjpbImRpZDpqd2siXSwidnBfZm9ybWF0cyI6eyJqd3RfdmMiOnsiYWxnIjpbIkVTMjU2Il19LCJqd3RfdnAiOnsiYWxnIjpbIkVTMjU2Il19fX0sInByZXNlbnRhdGlvbl9kZWZpbml0aW9uIjp7ImlkIjoiYXV0aG4td2l0aC12YyIsInB1cnBvc2UiOiJBdXRoZW50aWNhdGlvbiB1c2luZyBWQ3MiLCJmb3JtYXQiOnsiand0X3ZjIjp7ImFsZyI6WyJFUzI1NiJdfSwiand0X3ZwIjp7ImFsZyI6WyJFUzI1NiJdfX0sImlucHV0X2Rlc2NyaXB0b3JzIjpbeyJpZCI6ImJhc2ljLWluZm9ybWF0aW9uIiwibmFtZSI6IkJhc2ljIEluZm9ybWF0aW9uIiwicHVycG9zZSI6IkF1dGhlbnRpY2F0ZSB5b3UgdXNpbmcgYmFzaWMgaW5mb3JtYXRpb24iLCJjb25zdHJhaW50cyI6eyJmaWVsZHMiOlt7InBhdGgiOlsiJC5jcmVkZW50aWFsU3ViamVjdC5lbWFpbCIsIiQudmMuY3JlZGVudGlhbFN1YmplY3QuZW1haWwiLCIkLmNyZWRlbnRpYWxTdWJqZWN0LmVtYWlsQWRkcmVzcyIsIiQudmMuY3JlZGVudGlhbFN1YmplY3QuZW1haWxBZGRyZXNzIl19XX19XX0sIm5iZiI6MTcxNTAxMDgyOCwianRpIjoiZWY0NzlkMWQtMzNmNi00YzM2LWFjZjUtMWU3N2E5MTJmOWFkIiwiaXNzIjoiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5wMU9HdExhalJsUVVZNFNsZDRNbFIwY3pOWVUzUlpka1Z1VVdweFMyVmtNUzB6WWtkSVlXdDBNMEVpTENKNUlqb2lWRmcyZEZOR2VEQjBZV0Y0ZUdwdmJqVXhaREJSWVdndGRsQXRXblJJT0ZkclZIWndTRjl2ZUU1blp5SXNJbXRwWkNJNklrNUxkalJZUVVSa1RVeGlkek52UWtwalJEZEtYMmhNZEhjMmRXTnJRVTR0T1hNNWExQTJaRmxoVjFFaUxDSmhiR2NpT2lKRlV6STFOaUo5Iiwic3ViIjoiZGlkOmp3azpleUpyZEhraU9pSkZReUlzSW1OeWRpSTZJbEF0TWpVMklpd2llQ0k2SW5wMU9HdExhalJsUVVZNFNsZDRNbFIwY3pOWVUzUlpka1Z1VVdweFMyVmtNUzB6WWtkSVlXdDBNMEVpTENKNUlqb2lWRmcyZEZOR2VEQjBZV0Y0ZUdwdmJqVXhaREJSWVdndGRsQXRXblJJT0ZkclZIWndTRjl2ZUU1blp5SXNJbXRwWkNJNklrNUxkalJZUVVSa1RVeGlkek52UWtwalJEZEtYMmhNZEhjMmRXTnJRVTR0T1hNNWExQTJaRmxoVjFFaUxDSmhiR2NpT2lKRlV6STFOaUo5In0.nLeqSWTAyNk4b2SQwWU7DT3C1J1P2jFuaSH334LseBr0EUWfueps5qDvw-DfBIkuuGgBhag61IYV4UQyDuZy_A
*/
