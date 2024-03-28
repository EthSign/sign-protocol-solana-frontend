import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface SetPauseProps {
  program: anchor.Program | undefined;
  setTransactionUrl: (url: string) => void;
}

function SetPause(props: SetPauseProps) {
  const { setTransactionUrl, program } = props;

  const wallet = useAnchorWallet();

  const onClick = async (paused: boolean) => {
    if (!program || !wallet) {
      return;
    }

    const [storagePDA] = await PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("storage")],
      program.programId
    );

    try {
      const sig = await program.methods
        .setPause(paused)
        .accounts({
          authority: wallet.publicKey,
          storage: storagePDA,
        })
        .rpc();

      setTransactionUrl(`https://explorer.solana.com/tx/${sig}?cluster=devnet`);
    } catch (err: any) {
      setTransactionUrl(err.message ? err.message : err);
    }
  };
  return (
    <>
      <div className="mx-auto">
        <button
          className="border border-white rounded-md mx-auto px-4 py-2 hover:bg-white/20 active:bg-white/10"
          onClick={() => onClick(false)}
        >
          Set Pause (false)
        </button>
        <button
          className="border border-white rounded-md mx-auto px-4 py-2 hover:bg-white/20 active:bg-white/10"
          onClick={() => onClick(true)}
        >
          Set Pause (true)
        </button>
      </div>
    </>
  );
}

export default SetPause;
