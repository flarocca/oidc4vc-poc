import type { NextApiRequest, NextApiResponse } from "next";
import AuthenticationFlowDocument from "@/models/authenticationFlow";
import { extractClaimsFromVpToken } from "@/helpers/verifiableCredentials";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { txid } = req.query;

  console.error(
    `[OIDC Operational] POST /api/siop/responses/${txid} - Initiated`
  );

  try {
    const data: { vp_token: string } = req.body;

    console.log(
      `[OIDC Operational] POST /api/siopresponses/${txid} - Data: ${JSON.stringify(
        data,
        null,
        4
      )}`
    );

    if (!data.vp_token) {
      res.statusCode = 400;
      res.statusMessage = "bad_request";

      res.status(400).json({ success: false, error: "invalid_vp_token" });

      return;
    }

    const authFlow = await AuthenticationFlowDocument.findOneAndUpdate(
      {
        type: "siop",
        code: txid,
      },
      {
        status: "in-process",
      }
    ).exec();

    console.log(
      `[OIDC Operational] POST /api/siop/responses/${txid} - TRX Found`
    );

    const claims = extractClaimsFromVpToken(data.vp_token);

    await AuthenticationFlowDocument.create({
      type: "oidc",
      code: authFlow.code,
      state: authFlow.state,
      nonce: authFlow.nonce,
      redirectUri: authFlow.redirectUri,
      status: "initiated",
      data: claims,
    });

    await AuthenticationFlowDocument.updateOne(
      {
        type: "siop",
        code: txid,
      },
      {
        status: "complete",
      }
    ).exec();

    console.error(
      `[OIDC Operational] POST /api/siop/responses/${txid} - Complete`
    );

    res.status(204).end();
  } catch (error) {
    console.error(
      `[OIDC Operational] POST /api/siop/responses/${txid} - Error: ${JSON.stringify(
        error,
        null,
        4
      )}`
    );

    res.statusCode = 500;
    res.statusMessage = "internal_server_error";

    res.status(500).json({ error });
  }
}

/*
Request
  Body
  {
    "expires_in": "300",
    "state": "a67a57bb-8e2d-4f8b-8152-ee0fd4061931",
    "presentation_submission": {
      "id": "OMSBNzXn56Q43Yb1cTcds",
      "definition_id": "authn-with-vc",
      "descriptor_map": [
        {
          "id": "basic-information",
          "format": "jwt_vp",
          "path": "$",
          "path_nested": {
            "id": "basic-information",
            "format": "jwt_vc",
            "path": "$.vp.verifiableCredential[0]"
          }
        }
      ]
    },
    "vp_token": "eyJraWQiOiJkaWQ6andrOmV5SmhiR2NpT2lKRlV6STFOaUlzSW5WelpTSTZJbk5wWnlJc0ltdDBlU0k2SWtWRElpd2lZM0oySWpvaVVDMHlOVFlpTENKNElqb2lOMVpmWm5kUE1HZGhTVlJZYTBaNlpHaE5ibU4yYkZwU1J6RTNXRUpMYzBZd2NqQkdja2c0TURSV2F5SXNJbmtpT2lJMFQwbDFMVmh4ZEVObk1ESnpXVWhFWm01cWVFaEpNWEoyYVUxbWVVMWlVR3RQVnpFNGFVNUZSM1ZOSW4wIzAiLCJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MTUwMTAwODAsImV4cCI6MTcxNTAxMDY4MCwidnAiOnsiaG9sZGVyIjoiZGlkOmp3azpleUpoYkdjaU9pSkZVekkxTmlJc0luVnpaU0k2SW5OcFp5SXNJbXQwZVNJNklrVkRJaXdpWTNKMklqb2lVQzB5TlRZaUxDSjRJam9pTjFaZlpuZFBNR2RoU1ZSWWEwWjZaR2hOYm1OMmJGcFNSekUzV0VKTGMwWXdjakJHY2tnNE1EUldheUlzSW5raU9pSTBUMGwxTFZoeGRFTm5NREp6V1VoRVptNXFlRWhKTVhKMmFVMW1lVTFpVUd0UFZ6RTRhVTVGUjNWTkluMCIsIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5pSXNJbXRwWkNJNkltUnBaRHBxZDJzNlpYbEtjbVJJYTJsUGFVcEdVWGxKYzBsdFRubGthVWsyU1d4QmRFMXFWVEpKYVhkcFpVTkpOa2x1Y0RGUFIzUk1ZV3BTYkZGVldUUlRiR1EwVFd4U01HTjZUbGxWTTFKYVpHdFdkVlZYY0hoVE1sWnJUVk13ZWxsclpFbFpWM1F3VFRCRmFVeERTalZKYW05cFZrWm5NbVJHVGtkbFJFSXdXVmRHTkdWSGNIWmlhbFY0V2tSQ1VsbFhaM1JrYkVGMFYyNVNTVTlHWkhKV1NGcDNVMFk1ZG1WRk5XNWFlVWx6U1cxMGNGcERTVFpKYXpWTVpHcFNXVkZWVW10VVZYaHBaSHBPZGxGcmNHcFNSR1JMV0RKb1RXUklZekprVjA1eVVWVTBkRTlZVFRWaE1VRXlXa1pzYUZZeFJXbE1RMHBvWWtkamFVOXBTa1pWZWtreFRtbEtPU013SW4wLmV5SjJZeUk2ZXlKQVkyOXVkR1Y0ZENJNld5Sm9kSFJ3Y3pvdkwzZDNkeTUzTXk1dmNtY3ZNakF4T0M5amNtVmtaVzUwYVdGc2N5OTJNU0pkTENKMGVYQmxJanBiSWxabGNtbG1hV0ZpYkdWRGNtVmtaVzUwYVdGc0lpd2lSVzFoYVd4V1pYSnBabWxsWkVOeVpXUmxiblJwWVd3aVhTd2lhV1FpT2lKMWNtNDZkWFZwWkRvNU5EVmpZMlpsTUMxak5qRTFMVFEzTXpBdE9XWTBOeTFrT0ROak9UQmhZVFpqWkRNaUxDSnBjM04xWlhJaU9pSmthV1E2YW5kck9tVjVTbkprU0d0cFQybEtSbEY1U1hOSmJVNTVaR2xKTmtsc1FYUk5hbFV5U1dsM2FXVkRTVFpKYm5BeFQwZDBUR0ZxVW14UlZWazBVMnhrTkUxc1VqQmplazVaVlROU1dtUnJWblZWVjNCNFV6SldhMDFUTUhwWmEyUkpXVmQwTUUwd1JXbE1RMG8xU1dwdmFWWkdaekprUms1SFpVUkNNRmxYUmpSbFIzQjJZbXBWZUZwRVFsSlpWMmQwWkd4QmRGZHVVa2xQUm1SeVZraGFkMU5HT1habFJUVnVXbmxKYzBsdGRIQmFRMGsyU1dzMVRHUnFVbGxSVlZKclZGVjRhV1I2VG5aUmEzQnFVa1JrUzFneWFFMWtTR015WkZkT2NsRlZOSFJQV0UwMVlURkJNbHBHYkdoV01VVnBURU5LYUdKSFkybFBhVXBHVlhwSk1VNXBTamtpTENKcGMzTjFZVzVqWlVSaGRHVWlPaUl5TURJMExUQTFMVEEyVkRFMU9qTXpPalEyTGpreU5Gb2lMQ0pqY21Wa1pXNTBhV0ZzVTNWaWFtVmpkQ0k2ZXlKcFpDSTZJbVJwWkRwcWQyczZaWGxLYUdKSFkybFBhVXBHVlhwSk1VNXBTWE5KYmxaNldsTkpOa2x1VG5CYWVVbHpTVzEwTUdWVFNUWkphMVpFU1dsM2FWa3pTakpKYW05cFZVTXdlVTVVV1dsTVEwbzBTV3B2YVU0eFdtWmFibVJRVFVka2FGTldVbGxoTUZvMldrZG9UbUp0VGpKaVJuQlRVbnBGTTFkRlNreGpNRmwzWTJwQ1IyTnJaelJOUkZKWFlYbEpjMGx1YTJsUGFVa3dWREJzTVV4V2FIaGtSVTV1VFVSS2VsZFZhRVZhYlRWeFpVVm9TazFZU2pKaFZURnRaVlV4YVZWSGRGQldla1UwWVZVMVJsSXpWazVKYmpBaUxDSmxiV0ZwYkNJNkltWmhZM1V1YkdGeWIyTmpZVUJuYldGcGJDNWpiMjBpZlN3aVpYaHdhWEpoZEdsdmJrUmhkR1VpT2lJeU1ESTFMVEExTFRBMlZERTFPak16T2pRMkxqa3lORm9pZlN3aWJtSm1Jam94TnpFMU1EQTVOakkyTENKcWRHa2lPaUoxY200NmRYVnBaRG81TkRWalkyWmxNQzFqTmpFMUxUUTNNekF0T1dZME55MWtPRE5qT1RCaFlUWmpaRE1pTENKcGMzTWlPaUprYVdRNmFuZHJPbVY1U25Ka1NHdHBUMmxLUmxGNVNYTkpiVTU1WkdsSk5rbHNRWFJOYWxVeVNXbDNhV1ZEU1RaSmJuQXhUMGQwVEdGcVVteFJWVmswVTJ4a05FMXNVakJqZWs1WlZUTlNXbVJyVm5WVlYzQjRVekpXYTAxVE1IcFphMlJKV1ZkME1FMHdSV2xNUTBvMVNXcHZhVlpHWnpKa1JrNUhaVVJDTUZsWFJqUmxSM0IyWW1wVmVGcEVRbEpaVjJkMFpHeEJkRmR1VWtsUFJtUnlWa2hhZDFOR09YWmxSVFZ1V25sSmMwbHRkSEJhUTBrMlNXczFUR1JxVWxsUlZWSnJWRlY0YVdSNlRuWlJhM0JxVWtSa1MxZ3lhRTFrU0dNeVpGZE9jbEZWTkhSUFdFMDFZVEZCTWxwR2JHaFdNVVZwVEVOS2FHSkhZMmxQYVVwR1ZYcEpNVTVwU2praUxDSnpkV0lpT2lKa2FXUTZhbmRyT21WNVNtaGlSMk5wVDJsS1JsVjZTVEZPYVVselNXNVdlbHBUU1RaSmJrNXdXbmxKYzBsdGREQmxVMGsyU1d0V1JFbHBkMmxaTTBveVNXcHZhVlZETUhsT1ZGbHBURU5LTkVscWIybE9NVnBtV201a1VFMUhaR2hUVmxKWllUQmFObHBIYUU1aWJVNHlZa1p3VTFKNlJUTlhSVXBNWXpCWmQyTnFRa2RqYTJjMFRVUlNWMkY1U1hOSmJtdHBUMmxKTUZRd2JERk1WbWg0WkVWT2JrMUVTbnBYVldoRldtMDFjV1ZGYUVwTldFb3lZVlV4YldWVk1XbFZSM1JRVm5wRk5HRlZOVVpTTTFaT1NXNHdJaXdpYVdGMElqb3hOekUxTURBNU5qSTJMQ0psZUhBaU9qRTNORFkxTkRVMk1qWjkuMVc5NVNSU3R1T0hjSXlOdGVrUHNNUEFORnZrT1E0UXhoU0hVMkFwUE5oSTNUT3AyQWQxU1dJRkdRSHFvMWpoN2dCUnZ5b0VLUkJld1RWV3pNeHpKdHciXX0sIkBjb250ZXh0IjpbImh0dHBzOi8vd3d3LnczLm9yZy8yMDE4L2NyZWRlbnRpYWxzL3YxIl0sInR5cGUiOlsiVmVyaWZpYWJsZVByZXNlbnRhdGlvbiJdLCJob2xkZXIiOiJkaWQ6andrOmV5SmhiR2NpT2lKRlV6STFOaUlzSW5WelpTSTZJbk5wWnlJc0ltdDBlU0k2SWtWRElpd2lZM0oySWpvaVVDMHlOVFlpTENKNElqb2lOMVpmWm5kUE1HZGhTVlJZYTBaNlpHaE5ibU4yYkZwU1J6RTNXRUpMYzBZd2NqQkdja2c0TURSV2F5SXNJbmtpT2lJMFQwbDFMVmh4ZEVObk1ESnpXVWhFWm01cWVFaEpNWEoyYVUxbWVVMWlVR3RQVnpFNGFVNUZSM1ZOSW4wIiwidmVyaWZpYWJsZUNyZWRlbnRpYWwiOlsiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKRlV6STFOaUlzSW10cFpDSTZJbVJwWkRwcWQyczZaWGxLY21SSWEybFBhVXBHVVhsSmMwbHRUbmxrYVVrMlNXeEJkRTFxVlRKSmFYZHBaVU5KTmtsdWNERlBSM1JNWVdwU2JGRlZXVFJUYkdRMFRXeFNNR042VGxsVk0xSmFaR3RXZFZWWGNIaFRNbFpyVFZNd2VsbHJaRWxaVjNRd1RUQkZhVXhEU2pWSmFtOXBWa1puTW1SR1RrZGxSRUl3V1ZkR05HVkhjSFppYWxWNFdrUkNVbGxYWjNSa2JFRjBWMjVTU1U5R1pISldTRnAzVTBZNWRtVkZOVzVhZVVselNXMTBjRnBEU1RaSmF6Vk1aR3BTV1ZGVlVtdFVWWGhwWkhwT2RsRnJjR3BTUkdSTFdESm9UV1JJWXpKa1YwNXlVVlUwZEU5WVRUVmhNVUV5V2tac2FGWXhSV2xNUTBwb1lrZGphVTlwU2taVmVra3hUbWxLT1NNd0luMC5leUoyWXlJNmV5SkFZMjl1ZEdWNGRDSTZXeUpvZEhSd2N6b3ZMM2QzZHk1M015NXZjbWN2TWpBeE9DOWpjbVZrWlc1MGFXRnNjeTkyTVNKZExDSjBlWEJsSWpwYklsWmxjbWxtYVdGaWJHVkRjbVZrWlc1MGFXRnNJaXdpUlcxaGFXeFdaWEpwWm1sbFpFTnlaV1JsYm5ScFlXd2lYU3dpYVdRaU9pSjFjbTQ2ZFhWcFpEbzVORFZqWTJabE1DMWpOakUxTFRRM016QXRPV1kwTnkxa09ETmpPVEJoWVRaalpETWlMQ0pwYzNOMVpYSWlPaUprYVdRNmFuZHJPbVY1U25Ka1NHdHBUMmxLUmxGNVNYTkpiVTU1WkdsSk5rbHNRWFJOYWxVeVNXbDNhV1ZEU1RaSmJuQXhUMGQwVEdGcVVteFJWVmswVTJ4a05FMXNVakJqZWs1WlZUTlNXbVJyVm5WVlYzQjRVekpXYTAxVE1IcFphMlJKV1ZkME1FMHdSV2xNUTBvMVNXcHZhVlpHWnpKa1JrNUhaVVJDTUZsWFJqUmxSM0IyWW1wVmVGcEVRbEpaVjJkMFpHeEJkRmR1VWtsUFJtUnlWa2hhZDFOR09YWmxSVFZ1V25sSmMwbHRkSEJhUTBrMlNXczFUR1JxVWxsUlZWSnJWRlY0YVdSNlRuWlJhM0JxVWtSa1MxZ3lhRTFrU0dNeVpGZE9jbEZWTkhSUFdFMDFZVEZCTWxwR2JHaFdNVVZwVEVOS2FHSkhZMmxQYVVwR1ZYcEpNVTVwU2praUxDSnBjM04xWVc1alpVUmhkR1VpT2lJeU1ESTBMVEExTFRBMlZERTFPak16T2pRMkxqa3lORm9pTENKamNtVmtaVzUwYVdGc1UzVmlhbVZqZENJNmV5SnBaQ0k2SW1ScFpEcHFkMnM2WlhsS2FHSkhZMmxQYVVwR1ZYcEpNVTVwU1hOSmJsWjZXbE5KTmtsdVRuQmFlVWx6U1cxME1HVlRTVFpKYTFaRVNXbDNhVmt6U2pKSmFtOXBWVU13ZVU1VVdXbE1RMG8wU1dwdmFVNHhXbVphYm1SUVRVZGthRk5XVWxsaE1GbzJXa2RvVG1KdFRqSmlSbkJUVW5wRk0xZEZTa3hqTUZsM1kycENSMk5yWnpSTlJGSlhZWGxKYzBsdWEybFBhVWt3VkRCc01VeFdhSGhrUlU1dVRVUktlbGRWYUVWYWJUVnhaVVZvU2sxWVNqSmhWVEZ0WlZVeGFWVkhkRkJXZWtVMFlWVTFSbEl6Vms1SmJqQWlMQ0psYldGcGJDSTZJbVpoWTNVdWJHRnliMk5qWVVCbmJXRnBiQzVqYjIwaWZTd2laWGh3YVhKaGRHbHZia1JoZEdVaU9pSXlNREkxTFRBMUxUQTJWREUxT2pNek9qUTJMamt5TkZvaWZTd2libUptSWpveE56RTFNREE1TmpJMkxDSnFkR2tpT2lKMWNtNDZkWFZwWkRvNU5EVmpZMlpsTUMxak5qRTFMVFEzTXpBdE9XWTBOeTFrT0ROak9UQmhZVFpqWkRNaUxDSnBjM01pT2lKa2FXUTZhbmRyT21WNVNuSmtTR3RwVDJsS1JsRjVTWE5KYlU1NVpHbEpOa2xzUVhSTmFsVXlTV2wzYVdWRFNUWkpibkF4VDBkMFRHRnFVbXhSVlZrMFUyeGtORTFzVWpCamVrNVpWVE5TV21SclZuVlZWM0I0VXpKV2EwMVRNSHBaYTJSSldWZDBNRTB3UldsTVEwbzFTV3B2YVZaR1p6SmtSazVIWlVSQ01GbFhSalJsUjNCMlltcFZlRnBFUWxKWlYyZDBaR3hCZEZkdVVrbFBSbVJ5VmtoYWQxTkdPWFpsUlRWdVdubEpjMGx0ZEhCYVEwazJTV3MxVEdScVVsbFJWVkpyVkZWNGFXUjZUblpSYTNCcVVrUmtTMWd5YUUxa1NHTXlaRmRPY2xGVk5IUlBXRTAxWVRGQk1scEdiR2hXTVVWcFRFTkthR0pIWTJsUGFVcEdWWHBKTVU1cFNqa2lMQ0p6ZFdJaU9pSmthV1E2YW5kck9tVjVTbWhpUjJOcFQybEtSbFY2U1RGT2FVbHpTVzVXZWxwVFNUWkpiazV3V25sSmMwbHRkREJsVTBrMlNXdFdSRWxwZDJsWk0wb3lTV3B2YVZWRE1IbE9WRmxwVEVOS05FbHFiMmxPTVZwbVdtNWtVRTFIWkdoVFZsSlpZVEJhTmxwSGFFNWliVTR5WWtad1UxSjZSVE5YUlVwTVl6QlpkMk5xUWtkamEyYzBUVVJTVjJGNVNYTkpibXRwVDJsSk1GUXdiREZNVm1oNFpFVk9iazFFU25wWFZXaEZXbTAxY1dWRmFFcE5XRW95WVZVeGJXVlZNV2xWUjNSUVZucEZOR0ZWTlVaU00xWk9TVzR3SWl3aWFXRjBJam94TnpFMU1EQTVOakkyTENKbGVIQWlPakUzTkRZMU5EVTJNalo5LjFXOTVTUlN0dU9IY0l5TnRla1BzTVBBTkZ2a09RNFF4aFNIVTJBcFBOaEkzVE9wMkFkMVNXSUZHUUhxbzFqaDdnQlJ2eW9FS1JCZXdUVld6TXh6SnR3Il0sImF1ZCI6ImRpZDpqd2s6ZXlKcmRIa2lPaUpGUXlJc0ltTnlkaUk2SWxBdE1qVTJJaXdpZUNJNklucDFPR3RMYWpSbFFVWTRTbGQ0TWxSMGN6TllVM1JaZGtWdVVXcHhTMlZrTVMwellrZElZV3QwTTBFaUxDSjVJam9pVkZnMmRGTkdlREIwWVdGNGVHcHZialV4WkRCUllXZ3RkbEF0V25SSU9GZHJWSFp3U0Y5dmVFNW5aeUlzSW10cFpDSTZJazVMZGpSWVFVUmtUVXhpZHpOdlFrcGpSRGRLWDJoTWRIYzJkV05yUVU0dE9YTTVhMUEyWkZsaFYxRWlMQ0poYkdjaU9pSkZVekkxTmlKOSIsIm5iZiI6MTcxNTAxMDA4MCwic3ViIjoiZGlkOmp3azpleUpoYkdjaU9pSkZVekkxTmlJc0luVnpaU0k2SW5OcFp5SXNJbXQwZVNJNklrVkRJaXdpWTNKMklqb2lVQzB5TlRZaUxDSjRJam9pTjFaZlpuZFBNR2RoU1ZSWWEwWjZaR2hOYm1OMmJGcFNSekUzV0VKTGMwWXdjakJHY2tnNE1EUldheUlzSW5raU9pSTBUMGwxTFZoeGRFTm5NREp6V1VoRVptNXFlRWhKTVhKMmFVMW1lVTFpVUd0UFZ6RTRhVTVGUjNWTkluMCIsImlzc3VhbmNlRGF0ZSI6IjIwMjQtMDUtMDZUMTU6NDE6MjAuMjUzWiIsImlzcyI6ImRpZDpqd2s6ZXlKaGJHY2lPaUpGVXpJMU5pSXNJblZ6WlNJNkluTnBaeUlzSW10MGVTSTZJa1ZESWl3aVkzSjJJam9pVUMweU5UWWlMQ0o0SWpvaU4xWmZabmRQTUdkaFNWUllhMFo2WkdoTmJtTjJiRnBTUnpFM1dFSkxjMFl3Y2pCR2NrZzRNRFJXYXlJc0lua2lPaUkwVDBsMUxWaHhkRU5uTURKeldVaEVabTVxZUVoSk1YSjJhVTFtZVUxaVVHdFBWekU0YVU1RlIzVk5JbjAiLCJub25jZSI6IjBiYzdkNTZlLWFjNDAtNGU4Zi05YmM2LTI1NDdjMWNiNTFjZiJ9.EIGla7ioLelM4irhD3_8W7jbkZ51-LfXPDJL6bXo3QIAQhVLqPT7Mj5Cc7U4_ppYwWVYhYgB6R_SXF8QEoBX6w"
  }
*/
