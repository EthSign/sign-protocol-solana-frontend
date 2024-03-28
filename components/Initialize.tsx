import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface InitializeProps {
  program: anchor.Program | undefined;
  setTransactionUrl: (url: string) => void;
}

function Initialize(props: InitializeProps) {
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
      const sig = await program.methods
        .initialize()
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
      <button
        className="border border-white rounded-md mx-auto px-4 py-2 hover:bg-white/20 active:bg-white/10"
        onClick={onClick}
      >
        Initialize
      </button>
    </>
  );
}

export default Initialize;
