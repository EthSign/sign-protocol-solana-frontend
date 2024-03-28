import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface TransferOwnershipProps {
  program: anchor.Program | undefined;
  setTransactionUrl: (url: string) => void;
}

function TransferOwnership(props: TransferOwnershipProps) {
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
      const signerKeypair = new anchor.web3.PublicKey(
        (document.getElementById("newOwner") as HTMLInputElement)?.value ??
          undefined
      );
      if (!signerKeypair) {
        return;
      }

      const sig = await program.methods
        .transferOwnership(signerKeypair)
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
          placeholder="New Owner"
          className="text-black mx-auto"
        />
        <button
          className="border border-white rounded-md mx-auto px-4 py-2 hover:bg-white/20 active:bg-white/10"
          onClick={onClick}
        >
          Transfer Ownership
        </button>
      </div>
    </>
  );
}

export default TransferOwnership;
