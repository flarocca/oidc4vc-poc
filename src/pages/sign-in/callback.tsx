import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Callback() {
    const [token, setToken] = useState("");
    const [claims, setClaims] = useState(null);
  
    const searchParams = useSearchParams();
    const code = searchParams?.get("code");
  
    const exchangeToken = async () => {
      if (!code || token || claims) return;
  
      const response = await fetch("/api/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code: code,
          grant_type: "authorization_code",
        }),
      });
  
      if (response.ok) {
        const body: { access_token: string } = await response.json();
        const claims = jwtDecode<any>(body.access_token);
  
        setClaims(claims);
        setToken(body.access_token);
      }
    };
  
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="flex-col z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
          <p className="justify-center text-2xl border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
            Relaying Party (App) - Authentication Callback
          </p>
          {code ? (
            <button
              style={{ margin: "10px" }}
              className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              rel="noopener noreferrer"
              onClick={exchangeToken}
            >
              Exchange token
            </button>
          ) : null}
          {claims ? (
            <div
              className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
              style={{
                maxWidth: "600px",
                overflow: "auto",
                display: "block",
                margin: "20px",
              }}
            >
              <pre>
                <code>{JSON.stringify(claims, null, 4)}</code>
              </pre>
            </div>
          ) : null}
          {token ? (
            <div
              className="justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30"
              style={{
                maxWidth: "600px",
                overflow: "auto",
                display: "block",
                margin: "20px",
              }}
            >
              <pre>
                <code>{token}</code>
              </pre>
            </div>
          ) : null}
        </div>
        <Link 
          className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          href="/"
        >
          Home
        </Link>
      </main>
    );
}
