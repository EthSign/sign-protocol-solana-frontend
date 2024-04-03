import { Schema } from "@/types";
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
      const revocableInput = document.getElementById("revocableCheckbox") as HTMLInputElement;
      const dataLocation = document.getElementById("dataLocation") as HTMLInputElement;
      const maxValidFor = document.getElementById("maxValidFor") as HTMLInputElement;
      const dataInput = document.getElementById("dataInput") as HTMLInputElement;
      const schema: Schema = {
        id: key,
        registrant: wallet.publicKey,
        revocable: revocableInput.checked,
        dataLocation: dataLocation ? { onchain: {} } : { offchain: {} },
        maxValidFor: new anchor.BN(maxValidFor.value ?? "0"),
        timestamp: new anchor.BN(0),
        data: dataInput.value ? JSON.stringify(JSON.parse(dataInput.value)) : ""
      };

      const [schemaPDA] = await PublicKey.findProgramAddressSync(
        [anchor.utils.bytes.utf8.encode("schemaRegistry"), key.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const sig = await program.methods
        .register(key, schema, Buffer.from([]))
        .accounts({
          authority: wallet.publicKey,
          schema: schemaPDA,
          storage: storagePDA,
          // @ts-ignore
          hookStorage: null,
          // @ts-ignore
          hook: null,
          ixSysvar: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY
        })
        .rpc();

      setTransactionUrl(`Schema ${key.toString()} Created: https://explorer.solana.com/tx/${sig}?cluster=devnet`);
    } catch (err: any) {
      setTransactionUrl(err.message ? err.message : err);
    }
  };
  return (
    <>
      <div className="border-white border rounded-md mx-auto flex flex-col gap-1">
        <div className="mx-auto">
          <input type="checkbox" id="revocableCheckbox" />
          <span>Revocable</span>
        </div>
        <div className="mx-auto">
          <input type="checkbox" id="dataLocation" />
          <span>Data Location (onchain = checked, offchain = unchecked)</span>
        </div>
        <input className="mx-auto text-black" placeholder="Max Valid For (bignumber)" id="maxValidFor" />
        <input className="mx-auto text-black" placeholder="Data" id="dataInput" />
        <button
          className="border border-white rounded-md mx-auto px-4 py-2 hover:bg-white/20 active:bg-white/10"
          onClick={onClick}
        >
          Register
        </button>
      </div>
    </>
  );
}

export default Register;
