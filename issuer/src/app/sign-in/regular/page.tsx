"use client";

import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import QRCode from "@/components/qrcode";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [kycComplete, setKycComplete] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [vcEmailQR, setVcEmailQR] = useState("");
  const [vcKycQR, setVcKycQR] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [authState, setAuthState] = useState("");

  const code = searchParams?.get("code") || "code";

  const completeSignUp = async () => {
    try {
      const response = await fetch("/api/sign-in/regular", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          email,
          password,
          firstname,
          lastname,
          kycComplete,
          isEmailVerified,
        }),
      });

      if (response.ok) {
        const body: {
          code: string;
          redirect_uri: string;
          state: string;
          vc_email_uri: string;
          vc_kyc_uri: string;
        } = await response.json();

        if (body.vc_email_uri) {
          setVcEmailQR(body.vc_email_uri);
        }

        if (body.vc_kyc_uri) {
          setVcKycQR(body.vc_kyc_uri);
        }

        setAuthCode(body.code);
        setRedirectUri(body.redirect_uri);
        setAuthState(body.state);

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

  const finish = async () => {
    router.push(`${redirectUri}?code=${authCode}&state=${authState}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <p className="justify-center text-2xl border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Authenticate using email & pass
        </p>
      </div>

      <div className="flex-row max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <div className="flex-col z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
          <input
            className="text-2xl border-b border-gray-300 text-left group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            style={{ margin: "10px" }}
            type="text"
            name="email"
            id="email"
            placeholder="Email"
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="text-2xl border-b border-gray-300 text-left group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            style={{ margin: "10px" }}
            type="text"
            name="password"
            id="password"
            placeholder="Password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <input
            className="text-2xl border-b border-gray-300 text-left group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            style={{ margin: "10px" }}
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Firstname"
            onChange={(event) => setFirstname(event.target.value)}
          />
          <input
            className="text-2xl border-b border-gray-300 text-left group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            style={{ margin: "10px" }}
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Lastname"
            onChange={(event) => setLastname(event.target.value)}
          />
          <div className="flex-row z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
            <div style={{ margin: "10px" }}>
              <label htmlFor="isEmailVerified">Email Verified?</label>
              <input
                type="checkbox"
                name="isEmailVerified"
                id="isEmailVerified"
                onChange={(event) =>
                  setIsEmailVerified(event.target.value == "on")
                }
              />
            </div>
            <div style={{ margin: "10px" }}>
              <label htmlFor="isNew">KYC Complete?</label>
              <input
                type="checkbox"
                name="kyc"
                id="kyc"
                onChange={(event) => setKycComplete(event.target.value == "on")}
              />
            </div>
          </div>
          <button
            style={{ margin: "10px" }}
            className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
            onClick={completeSignUp}
          >
            Sign Up
          </button>
          <br />
          <p>Or</p>
          <br />
          <button
            style={{ margin: "10px" }}
            className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
          >
            Sign In with Google
          </button>
          <button
            style={{ margin: "10px" }}
            className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
          >
            Sign In with Forte
          </button>
        </div>
        <div>
          {vcEmailQR ? (
            <div
              className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
              style={{ margin: "20px" }}
            >
              <span>Email Verified VC</span>
              <br />
              <QRCode url={vcEmailQR} width={250} />
              <br />
              <span>{vcEmailQR}</span>
            </div>
          ) : null}

          {vcKycQR ? (
            <div
              className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
              style={{ margin: "20px" }}
            >
              <span>KYC VC</span>
              <br />
              <QRCode url={vcKycQR} width={250} />
              <br />
              <span>{vcKycQR}</span>
            </div>
          ) : null}
        </div>
      </div>

      <button
        style={{ margin: "10px" }}
        className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        rel="noopener noreferrer"
        onClick={finish}
      >
        Finish
      </button>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
      <Toaster />
    </main>
  );
}
