import { _createMockAttestations, _createMockSchemas } from "@/utils/misc";
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

export interface AttestProps {
  program: anchor.Program | undefined;
  setTransactionUrl: (url: string) => void;
}

function Attest(props: AttestProps) {
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
      const schemaKey = new anchor.BN(
        (document.getElementById("attestSchemaId") as HTMLInputElement)
          ?.value ?? undefined
      );
      const attKey: anchor.BN = new anchor.BN(Math.floor(Math.random() * 1e15));
      let [attestations, indexingKeys] = _createMockAttestations(
        wallet,
        attKey,
        [schemaKey, schemaKey]
      );
      const [schemaPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("schemaRegistry"),
          schemaKey.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );
      const [attPDA] = await PublicKey.findProgramAddressSync(
        [
          anchor.utils.bytes.utf8.encode("attestationRegistry"),
          attestations[0].id.toArrayLike(Buffer, "le", 8),
        ],
        program.programId
      );
      const sig = await program.methods
        .attest(
          new anchor.BN(attestations[0].id),
          attestations[0],
          indexingKeys[0],
          Buffer.from([]),
          Buffer.from([])
        )
        .accounts({
          authority: wallet.publicKey,
          // @ts-ignore
          linkedAttestation: null,
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

      const att = (await program.account.attestationAccount.fetch(attPDA))
        .attestation as any;
      setTransactionUrl(
        `Attestation ${attKey.toString()} Created: https://explorer.solana.com/tx/${sig}?cluster=devnet`
      );
    } catch (err: any) {
      setTransactionUrl(err.message ? err.message : err);
    }
  };
  return (
    <>
      <div className="mx-auto">
        <input
          id="attestSchemaId"
          placeholder="Schema ID"
          className="text-black mx-auto"
        />
        <button
          className="border border-white rounded-md mx-auto px-4 py-2 hover:bg-white/20 active:bg-white/10"
          onClick={onClick}
        >
          Attest
        </button>
      </div>
    </>
  );
}

export default Attest;
