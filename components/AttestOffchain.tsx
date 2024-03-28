import { _createMockAttestations, _createMockSchemas } from "@/utils/misc";
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface AttestOffchainProps {
  program: anchor.Program | undefined;
  setTransactionUrl: (url: string) => void;
}

function AttestOffchain(props: AttestOffchainProps) {
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
      const attKey = new anchor.BN(Math.floor(Math.random() * 1e15));
      const [attPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("offchainAttestationRegistry"),
          new anchor.BN(attKey).toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );
      const sig = await program.methods
        .attestOffchain(
          new anchor.BN(attKey),
          PublicKey.default,
          Buffer.from([])
        )
        .accounts({
          authority: wallet.publicKey,
          attestation: attPDA,
          storage: storagePDA,
          // @ts-ignore
          hookStorage: null,
          // @ts-ignore
          hook: null,
          ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .rpc();

      setTransactionUrl(
        `Offchain Attestation ${attKey.toString()} Created: https://explorer.solana.com/tx/${sig}?cluster=devnet`
      );
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
        Attest Offchain
      </button>
    </>
  );
}

export default AttestOffchain;
