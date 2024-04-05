"use client";

import { useState } from "react";
import QRCode from "@/components/qrcode";
import { useRouter, useSearchParams } from "next/navigation";

export default function Callback() {
  const searchParams = useSearchParams();

  const code = searchParams?.get("code") || "code";
  const state = searchParams?.get("state") || "state";
  const nonce = searchParams?.get("nonce") || "nonce";

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <p className="justify-center text-2xl border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Relaying Party (Game) - Authentication Callback
        </p>
      </div>
    </main>
  );
}
