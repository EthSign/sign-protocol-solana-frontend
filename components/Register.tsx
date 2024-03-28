import { _createMockSchemas } from "@/utils/misc";
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface RegisterProps {
  program: anchor.Program | undefined;
  setTransactionUrl: (url: string) => void;
}

function Register(props: RegisterProps) {
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
      const key = new anchor.BN(Math.floor(Math.random() * 1e15));
      const schemas = _createMockSchemas(wallet, key);
      const [schemaPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("schemaRegistry"),
          key.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );
      const sig = await program.methods
        .register(key, schemas[0], Buffer.from([]))
        .accounts({
          authority: wallet.publicKey,
          schema: schemaPDA,
          storage: storagePDA,
          // @ts-ignore
          hookStorage: null,
          // @ts-ignore
          hook: null,
          ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        })
        .rpc();

      setTransactionUrl(
        `Schema ${key.toString()} Created: https://explorer.solana.com/tx/${sig}?cluster=devnet`
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
        Register
      </button>
    </>
  );
}

export default Register;
