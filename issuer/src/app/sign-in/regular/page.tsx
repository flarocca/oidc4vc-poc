"use client";

import { useState } from "react";
import QRCode from "@/components/qrcode";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [kycComplete, setKycComplete] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [vcRefEmailQR, setVcRefEmailQR] = useState("");
  const [vcValEmailQR, setVcValEmailQR] = useState("");
  const [vcRefKycQR, setVcRefKycQR] = useState("");
  const [vcValKycQR, setVcValKycQR] = useState("");
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
          redirectUri: string;
          state: string;
          vcRefEmailUri: string;
          vcValEmailUri: string;
          vcRefKycUri: string;
          vcValKycUri: string;
        } = await response.json();

        if (body.vcRefEmailUri) {
          setVcRefEmailQR(body.vcRefEmailUri);
        }

        if (body.vcValEmailUri) {
          setVcValEmailQR(body.vcValEmailUri);
        }

        if (body.vcRefKycUri) {
          setVcRefKycQR(body.vcRefKycUri);
        }

        if (body.vcValKycUri) {
          setVcValKycQR(body.vcValKycUri);
        }

        setAuthCode(body.code);
        setRedirectUri(body.redirectUri);
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

  const redirectBackToRp = async () => {
    router.push(`${redirectUri}?code=${authCode}&state=${authState}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 forte">
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
        <div className="flex-row z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
          {vcValEmailQR ? (
            <div>
              <div
                className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
                style={{ margin: "20px" }}
              >
                <span>Email Verified VC - VAL</span>
                <br />
                <br />
                <QRCode url={vcValEmailQR} width={300} />
                <br />
                <span
                  style={{
                    display: "block",
                    maxWidth: "300px",
                    overflowY: "auto",
                  }}
                >
                  {vcValEmailQR}
                </span>
              </div>
              <div
                className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
                style={{ margin: "20px" }}
              >
                <span>Email Verified VC - REF</span>
                <br />
                <br />
                <QRCode url={vcRefEmailQR} width={300} />
                <br />
                <span
                  style={{
                    display: "block",
                    maxWidth: "300px",
                    overflowY: "auto",
                  }}
                >
                  {vcRefEmailQR}
                </span>
              </div>
            </div>
          ) : null}

          {vcValKycQR ? (
            <div>
              <div
                className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
                style={{ margin: "20px" }}
              >
                <span>KYC VC - VAL</span>
                <br />
                <br />
                <QRCode url={vcValKycQR} width={300} />
                <br />
                <span
                  style={{
                    display: "block",
                    maxWidth: "300px",
                    overflowY: "auto",
                  }}
                >
                  {vcValKycQR}
                </span>
              </div>
              <div
                className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
                style={{ margin: "20px" }}
              >
                <span>KYC VC - REF</span>
                <br />
                <br />
                <QRCode url={vcRefKycQR} width={300} />
                <br />
                <span
                  style={{
                    display: "block",
                    maxWidth: "300px",
                    overflowY: "auto",
                  }}
                >
                  {vcRefKycQR}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {authCode && authState && redirectUri ? (
        <div className="flex-row max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
          <CountdownCircleTimer
            isPlaying
            duration={10}
            colors={["#004777", "#F7B801", "#A30000", "#A30000"]}
            colorsTime={[7, 5, 2, 0]}
            onUpdate={async (remainingTime) => {
              if (!remainingTime) await redirectBackToRp();
            }}
          >
            {({ remainingTime }) =>
              `You will be redirected back to the RP in ${remainingTime}`
            }
          </CountdownCircleTimer>
          <button
            style={{ margin: "10px" }}
            className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            rel="noopener noreferrer"
            onClick={redirectBackToRp}
          >
            Redirect manually
          </button>
        </div>
      ) : null}

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
      <Toaster />
    </main>
  );
}
