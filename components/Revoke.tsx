import { Attestation } from "@/types";
import { _createMockReasons } from "@/utils/misc";
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface RevokeProps {
  program: anchor.Program | undefined;
  setTransactionUrl: (url: string) => void;
}

function Revoke(props: RevokeProps) {
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
      const attKey = new anchor.BN(
        (document.getElementById("revokeAttId") as HTMLInputElement)?.value ??
          undefined
      );
      const [attPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("attestationRegistry"),
          attKey.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );
      const schemaKey = (
        (await program.account.attestationAccount.fetch(attPDA)).attestation as
          | Attestation
          | undefined
      )?.schemaId;
      if (!schemaKey) {
        setTransactionUrl("Invalid schema ID for provided attestation");
        return;
      }
      const [schemaPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("schemaRegistry"),
          schemaKey.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );

      const reasons = _createMockReasons();
      const sig = await program.methods
        .revoke(attKey, reasons[0], Buffer.from([]), Buffer.from([]))
        .accounts({
          authority: wallet.publicKey,
          attestation: attPDA,
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
        `Attestation ${attKey.toString()} Revoked: https://explorer.solana.com/tx/${sig}?cluster=devnet`
      );
    } catch (err: any) {
      setTransactionUrl(err.message ? err.message : err);
    }
  };
  return (
    <>
      <div className="mx-auto">
        <input
          id="revokeAttId"
          placeholder="Revocable Attestation ID"
          className="text-black mx-auto"
        />
        <button
          className="border border-white rounded-md mx-auto px-4 py-2 hover:bg-white/20 active:bg-white/10"
          onClick={onClick}
        >
          Revoke
        </button>
      </div>
    </>
  );
}

export default Revoke;
