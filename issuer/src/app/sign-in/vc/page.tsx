"use client";

import { useState } from "react";
import QRCode from "@/components/qrcode";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [qrcode, setQrcode] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [status, setStatus] = useState("");
  const [requireKyc, setRequireKyc] = useState(false);
  const [requireEmailVerified, setRequireEmailVerified] = useState(false);
  const [requirePii, setRequirePii] = useState(false);

  const code = searchParams?.get("code") || "code";

  const generateQr = async () => {
    try {
      const response = await fetch("/api/sign-in/vc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          requireEmailVerified,
          requireKyc,
          requirePii,
        }),
      });

      if (response.ok) {
        const body: {
          code: string;
          state: string;
          request_uri: string;
        } = await response.json();

        if (body.request_uri) {
          setQrcode(body.request_uri);
        }

        setAuthCode(body.code);

        toast.success(
          "Sign Up completed successfully. Redirecting to client app."
        );
      } else {
        toast.error("Error processing Authorize request");
      }
    } catch (error) {
      console.log(JSON.stringify(error));
      toast.error("Error processing Authorize request");
    }
  };

  const refresh = async () => {
    try {
      const response = await fetch(`/api/openid-vc/status/${authCode}`, {
        method: "GET",
      });

      if (response.ok) {
        const body: {
          status: string;
        } = await response.json();

        setStatus(body.status);
      } else {
        toast.error("Error querying request status");
      }
    } catch (error) {
      console.log(JSON.stringify(error));
      toast.error("Error querying request status");
    }
  };

  const complete = async () => {
    try {
      const response = await fetch(`/api/oauth2/authorize/oidc/${authCode}`, {
        method: "GET",
      });

      if (response.ok) {
        const body: {
          data: {
            code: string;
            redirectUri: string;
          };
        } = await response.json();

        router.push(`${body.data.redirectUri}?code=${body.data.code}`);
      } else {
        toast.error("Error completing flow");
      }
    } catch (error) {
      console.log(JSON.stringify(error));
      toast.error("Error querying request status");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <p className="justify-center text-2xl border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Authenticate using VC
        </p>
      </div>

      <div className="flex-row max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <div className="flex-col z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
          <div style={{ margin: "10px" }}>
            <label htmlFor="email">Require Email Verified?</label>
            <input
              type="checkbox"
              name="email"
              id="email"
              onChange={(event) =>
                setRequireEmailVerified(event.target.checked)
              }
            />
          </div>
          <div style={{ margin: "10px" }}>
            <label htmlFor="kyc">Require KYC?</label>
            <input
              type="checkbox"
              name="kyc"
              id="kyc"
              onChange={(event) => setRequireKyc(event.target.checked)}
            />
          </div>
          <div style={{ margin: "10px" }}>
            <label htmlFor="pii">Require PII?</label>
            <input
              type="checkbox"
              name="pii"
              id="pii"
              onChange={(event) => setRequirePii(event.target.checked)}
            />
          </div>
          <button
            style={{ margin: "10px" }}
            className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
            onClick={generateQr}
          >
            Sign Up
          </button>
        </div>
        <div>
          {qrcode ? (
            <div
              className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
              style={{ margin: "20px" }}
            >
              <span>Scan this QR Code to Sign In</span>
              <br />
              <QRCode url={qrcode} width={250} />
              <br />
              <span>{qrcode}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <button
          style={{ margin: "10px" }}
          className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
          onClick={refresh}
        >
          Refresh
        </button>
        <span>Status: {status}</span>
      </div>
      {status == "complete" ? (
        <div>
          <button
            style={{ margin: "10px" }}
            className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
            onClick={complete}
          >
            Complete
          </button>
        </div>
      ) : null}

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
    </main>
  );
}
