"use client";

import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import QRCode from "@/components/qrcode";
import { useState } from "react";

export default function Authorize() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [qrcode, setqrcode] = useState("");

  const redirect_uri = searchParams?.get("redirect_uri") || "redirect_uri";
  const state = searchParams?.get("state") || "state";
  const nonce = searchParams?.get("nonce") || "nonce";

  const signInRegular = async () => {
    try {
      const response = await fetch("/api/oauth2/authorize/oidc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state,
          nonce,
          redirect_uri,
        }),
      });

      if (response.ok) {
        const body: { data: { code: string } } = await response.json();

        router.push(`/sign-in/regular?code=${body.data.code}`);
      } else {
        toast.error("Error processing Authorize request");
      }
    } catch (error) {
      console.log(JSON.stringify(error));
      toast.error("Error processing Authorize request");
    }
  };

  const signInWithVc = async () => {
    try {
      // const response = await fetch("/api/vc/credential-authn", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     state,
      //     nonce,
      //   }),
      // });

      const response = await fetch("/api/oauth2/authorize/vc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state,
          nonce,
          redirect_uri,
        }),
      });

      // if (response.ok) {
      //   const body: {
      //     data: { code: string; state: string; request_uri: string };
      //   } = await response.json();
      //   setqrcode(body.data.request_uri);
      // } else {
      //   toast.error("Error processing Authorize request");
      // }
      if (response.ok) {
        const body: { data: { code: string } } = await response.json();

        router.push(`/sign-in/vc?code=${body.data.code}`);
      } else {
        toast.error("Error processing Authorize request");
      }
    } catch (error) {
      console.log(JSON.stringify(error));
      toast.error("Error processing Authorize request");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 forte">
      <div className="flex-col z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <button
          className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={signInRegular}
        >
          OIDC Regular Login
        </button>
        <br />
        <button
          className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={async () => {
            try {
              const response = await fetch("/api/oauth2/authorize/siop/v1", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  state,
                  nonce,
                }),
              });

              if (response.ok) {
                const body: {
                  data: { code: string; state: string; siop_uri: string };
                } = await response.json();
                setqrcode(body.data.siop_uri);
              } else {
                toast.error("Error processing Authorize request");
              }
            } catch (error) {
              console.log(JSON.stringify(error));
              toast.error("Error processing Authorize request");
            }
          }}
        >
          Login with SIOP
        </button>
        <br />
        <button
          className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={signInWithVc}
        >
          Login with VC
        </button>
        <br />
        <button
          className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          onClick={async () => {
            try {
              const response = await fetch("/api/vc/credential-offer", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  state,
                  nonce,
                }),
              });

              if (response.ok) {
                const body: {
                  data: {
                    code: string;
                    state: string;
                    credential_offer_uri: string;
                  };
                } = await response.json();
                setqrcode(body.data.credential_offer_uri);
              } else {
                toast.error("Error processing VC Issuance");
              }
            } catch (error) {
              console.log(JSON.stringify(error));
              toast.error("Error processing VC Issuance");
            }
          }}
        >
          Issue VC
        </button>

        {qrcode ? (
          <div>
            <br />
            <QRCode url={qrcode} />
            <br />
            <span>{qrcode}</span>
          </div>
        ) : null}
      </div>
    </main>
  );
}
