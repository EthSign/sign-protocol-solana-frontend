import * as anchor from "@coral-xyz/anchor";
import Initialize from "@/components/Initialize";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import idl from "../artifacts/sign_protocol_solana.json";
import TransferOwnership from "@/components/TransferOwnership";
import dynamic from "next/dynamic";
import SetPause from "@/components/SetPause";
import SetGlobalHook from "@/components/SetGlobalHook";
import Register from "@/components/Register";
import Attest from "@/components/Attest";
import AttestOffchain from "@/components/AttestOffchain";
import Revoke from "@/components/Revoke";
import RevokeOffchain from "@/components/RevokeOffchain";
const AppBar = dynamic(() => import("@/components/AppBar"), {
  ssr: false,
});

export const PROGRAM_ID = new anchor.web3.PublicKey(
  `BX3HpkxVNbmpeT6PQhKV45rG7ytGY8WZRsHShnWYsr7X`
);

export default function Home() {
  const [transactionUrl, setTransactionUrl] = useState<string>();
  const [program, setProgram] = useState<anchor.Program>();
  const walletContextState = useWallet();

  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (!wallet) {
      return;
    }

    let provider: anchor.Provider;

    try {
      provider = anchor.getProvider();
    } catch {
      provider = new anchor.AnchorProvider(connection, wallet, {});
      anchor.setProvider(provider);
    }

    const program = new anchor.Program(idl as anchor.Idl, PROGRAM_ID);
    setProgram(program);
  }, [wallet]);

  return (
    <>
      <AppBar />
      {walletContextState.connected ? (
        <div className="flex flex-col">
          <Initialize setTransactionUrl={setTransactionUrl} program={program} />
          <TransferOwnership
            setTransactionUrl={setTransactionUrl}
            program={program}
          />
          <SetPause setTransactionUrl={setTransactionUrl} program={program} />
          <SetGlobalHook
            setTransactionUrl={setTransactionUrl}
            program={program}
          />
          <Register setTransactionUrl={setTransactionUrl} program={program} />
          <Attest setTransactionUrl={setTransactionUrl} program={program} />
          <AttestOffchain
            setTransactionUrl={setTransactionUrl}
            program={program}
          />
          <Revoke setTransactionUrl={setTransactionUrl} program={program} />
          <RevokeOffchain
            setTransactionUrl={setTransactionUrl}
            program={program}
          />
        </div>
      ) : null}
      {transactionUrl ? (
        <div className="mx-auto text-center mt-4">{transactionUrl}</div>
      ) : null}
    </>
  );
}
