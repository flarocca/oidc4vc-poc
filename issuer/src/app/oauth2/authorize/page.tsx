'use client'
 
import { useSearchParams } from 'next/navigation';
import toast from "react-hot-toast";
import QRCode from "@/components/qrcode";
import { useState } from 'react';


export default function Authorize() {
  const searchParams = useSearchParams();
  const [qrcode_siop, setqrcode_siop] = useState("");
  const [qrcode_openidvc, setqrcode_openidvc] = useState("");
  const [qrcode_vc, setqrcode_vc] = useState("");

  const redirect_uri = searchParams?.get('redirect_uri');
  const state = searchParams?.get('state');
  const nonce = searchParams?.get('nonce');

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <button onClick={async () => {
          try {
            const response = await fetch("/api/oauth2/authorize/oidc", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                state,
                nonce
              }),
            });

            if (response.ok) {
              const body: {data: {code: string, state: string}} = await response.json();
              if(redirect_uri) {
                window.location.assign(`${redirect_uri}?code=${body.data.code}&state=${body.data.state}`)
              }
            } else {
              toast.error("Error processing Authorize request");
            }

          } catch (error) {
            console.log(JSON.stringify(error));
            toast.error("Error processing Authorize request");
          }
        }}>OIDC Regular Login</button>
        <br />
        <div>
          <button onClick={async () => {
            try {
              const response = await fetch("/api/oauth2/authorize/siop/v1", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  state,
                  nonce
                }),
              });

              if (response.ok) {
                const body: {data: {code: string, state: string, siop_uri: string}} = await response.json();
                setqrcode_siop(body.data.siop_uri);
              } else {
                toast.error("Error processing Authorize request");
              }

            } catch (error) {
              console.log(JSON.stringify(error));
              toast.error("Error processing Authorize request");
            }
          }}>Login with SIOP</button>
          {
            qrcode_siop ? 
            <div>
              <br />
              <QRCode url={qrcode_siop} />
              <br />
              <span>{qrcode_siop}</span>
            </div> 
            : null
          }
        </div>
        <br />
        <div>
          <button onClick={async () => {
            try {
              const response = await fetch("/api/vc/credential-authn", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  state,
                  nonce
                }),
              });

              if (response.ok) {
                const body: {data: {code: string, state: string, request_uri: string}} = await response.json();
                setqrcode_openidvc(body.data.request_uri);
              } else {
                toast.error("Error processing Authorize request");
              }

            } catch (error) {
              console.log(JSON.stringify(error));
              toast.error("Error processing Authorize request");
            }
          }}>Login with VC</button>
          {
            qrcode_openidvc ? 
            <div>
              <br />
              <QRCode url={qrcode_openidvc} />
              <br />
              <span>{qrcode_openidvc}</span>
            </div> 
            : null
          }
        </div>
      </div>
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <button onClick={async () => {
          try {
            const response = await fetch("/api/vc/credential-offer", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                state,
                nonce
              }),
            });

            if (response.ok) {
              const body: {data: {code: string, state: string, credential_offer_uri: string}} = await response.json();
              setqrcode_vc(body.data.credential_offer_uri);
            } else {
              toast.error("Error processing VC Issuance");
            }

          } catch (error) {
            console.log(JSON.stringify(error));
            toast.error("Error processing VC Issuance");
          }
        }}>Issue VC</button>
        {qrcode_vc ? 
          <div>
            <br />
            <QRCode url={qrcode_vc} />
            <br />
            <span>{qrcode_vc}</span>
          </div> 
          : null}
      </div>
    </main>
  );
}