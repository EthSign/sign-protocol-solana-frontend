import { Attestation } from "@/types";
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
        (document.getElementById("attestSchemaId") as HTMLInputElement)?.value ?? undefined
      );
      const attKey: anchor.BN = new anchor.BN(Math.floor(Math.random() * 1e15));

      const linkedAttestation = document.getElementById("linkedAttestation") as HTMLInputElement;
      const validUntil = document.getElementById("validUntil") as HTMLInputElement;
      const dataLocation = document.getElementById("dataLocation") as HTMLInputElement;
      const indexingKey = document.getElementById("indexingKey") as HTMLInputElement;
      const dataInput = document.getElementById("dataInput") as HTMLInputElement;
      const recipients = dataInput.value
        ? (JSON.parse(dataInput.value ?? "[]") as string[]).map((val) => new PublicKey(val))
        : [wallet.publicKey];
      let attestation: Attestation = {
        id: attKey,
        schemaId: schemaKey,
        linkedAttestationId: linkedAttestation.value ? new anchor.BN(linkedAttestation.value) : undefined,
        attestTimestamp: new anchor.BN(0),
        revokeTimestamp: new anchor.BN(0),
        data: Buffer.from(dataInput.value ?? ""),
        attester: wallet.publicKey,
        validUntil: new anchor.BN(validUntil.value ?? "0"),
        dataLocation: dataLocation ? { onchain: {} } : { offchain: {} },
        revoked: false,
        recipients
      };
      const [schemaPDA] = await PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("schemaRegistry"), schemaKey.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const [attPDA] = await PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("attestationRegistry"), attestation.id.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const sig = await program.methods
        .attest(new anchor.BN(attestation.id), attestation, indexingKey.value, Buffer.from([]), Buffer.from([]))
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
          ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY
        })
        .rpc();

      const att = (await program.account.attestationAccount.fetch(attPDA)).attestation as any;
      setTransactionUrl(
        `Attestation ${attKey.toString()} Created: https://explorer.solana.com/tx/${sig}?cluster=devnet`
      );
    } catch (err: any) {
      setTransactionUrl(err.message ? err.message : err);
    }
  };
  return (
    <>
      <div className="border-white border rounded-md mx-auto flex flex-col gap-1">
        <div className="mx-auto">
          <input type="checkbox" id="dataLocation" />
          <span>Data Location (onchain = checked, offchain = unchecked)</span>
        </div>
        <input className="mx-auto text-black" placeholder="Valid Until (bignumber)" id="validUntil" />
        <input className="mx-auto text-black" placeholder="Indexing Key" id="indexingKey" />
        <input className="mx-auto text-black" placeholder="Linked Attestation ID" id="linkedAttestation" />
        <input className="mx-auto text-black" placeholder="Data" id="dataInput" />
        <input className="mx-auto text-black" placeholder="Recipients (JS array)" id="recipients" />
        <input id="attestSchemaId" placeholder="Schema ID" className="text-black mx-auto" />
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
