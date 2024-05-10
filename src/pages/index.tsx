import { v4 as uuidv4 } from "uuid";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <p className="justify-center text-2xl border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Relaying Party (App)
        </p>
      </div>

      <div className="z-10 max-w-5xl w-full items-center justify-center font-mono text-sm lg:flex">
        <a
          href={`${process.env.EXTERNAL_SERVER_URI as string}/oauth2/authorize?client_id=vc_demo&redirect_uri=${process.env.EXTERNAL_SERVER_URI as string}%2Fsign-in%2Fcallback&state=state-${uuidv4()}&nonce=nonce-${uuidv4()}&response_type=code&scope=openid+email+profile`}
          className="text-2xl border-b border-gray-300 text-center group rounded-lg border bg-gradient-to-b px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          rel="noopener noreferrer"
        >
          Login
        </a>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left"></div>
    </main>
  );
}
