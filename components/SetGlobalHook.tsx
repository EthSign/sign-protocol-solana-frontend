import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface SetGlobalHookProps {
  program: anchor.Program | undefined;
  setTransactionUrl: (url: string) => void;
}

function SetGlobalHook(props: SetGlobalHookProps) {
  const { setTransactionUrl, program } = props;

  const wallet = useAnchorWallet();

  const onClick = async () => {
    if (!program || !wallet) {
      return;
    }

    const [storagePDA] = await PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("storage")],
      program.programId
    );

    try {
      const hookKeypair = new anchor.web3.PublicKey(
        (document.getElementById("newOwner") as HTMLInputElement)?.value ??
          undefined
      );
      if (!hookKeypair) {
        return;
      }

      const sig = await program.methods
        .setGlobalHook(hookKeypair)
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
        <input
          id="newOwner"
          placeholder="Global Hook"
          className="text-black mx-auto"
        />
        <button
          className="border border-white rounded-md mx-auto px-4 py-2 hover:bg-white/20 active:bg-white/10"
          onClick={onClick}
        >
          Set Global Hook
        </button>
      </div>
      <div className="mx-auto">
        NOTE: If the global hook is set, all functions below this message will
        fail because they are not passing in a global hook address.
      </div>
    </>
  );
}

export default SetGlobalHook;
