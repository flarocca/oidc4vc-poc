"use client";

import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function Authorize() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUri = searchParams?.get("redirect_uri") || "redirect_uri";
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
          redirectUri,
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
      const response = await fetch("/api/oauth2/authorize/vc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state,
          nonce,
          redirectUri,
        }),
      });

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

  const signInWithSiop = async () => {
    try {
      const response = await fetch("/api/oauth2/authorize/siop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state,
          nonce,
          redirectUri,
        }),
      });

      if (response.ok) {
        const body: { data: { code: string } } = await response.json();

        router.push(`/sign-in/siop?code=${body.data.code}`);
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
          Login with Regular OIDC
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
          onClick={signInWithSiop}
        >
          Login with SIOP
        </button>
      </div>
      <Toaster />
    </main>
  );
}
