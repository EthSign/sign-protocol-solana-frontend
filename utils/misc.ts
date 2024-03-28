import * as anchor from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { Attestation } from "@/types";

export function _createMockSchemas(wallet: AnchorWallet, startId: number = 0) {
  let schema: {
    id: anchor.BN;
    registrant: PublicKey;
    revocable: boolean;
    dataLocation: any;
    maxValidFor: anchor.BN;
    timestamp: anchor.BN;
    data: string;
  } = {
    id: new anchor.BN(startId + 0),
    registrant: wallet.publicKey,
    revocable: true,
    dataLocation: { onchain: {} },
    maxValidFor: new anchor.BN(0),
    timestamp: new anchor.BN(0),
    data: "stupid0",
  };
  let schema2 = {
    id: new anchor.BN(startId + 1),
    registrant: wallet.publicKey,
    revocable: false,
    dataLocation: { onchain: {} },
    maxValidFor: new anchor.BN(100),
    timestamp: new anchor.BN(0),
    data: "stupid1",
  };

  return [schema, schema2];
}

export function _createMockAttestations(
  wallet: AnchorWallet,
  startId: anchor.BN = new anchor.BN(1),
  schemaIds: anchor.BN[]
): [Attestation[], string[]] {
  let attestation: {
    id: anchor.BN;
    schemaId: anchor.BN;
    linkedAttestationId: anchor.BN;
    attestTimestamp: anchor.BN;
    revokeTimestamp: anchor.BN;
    attester: PublicKey;
    validUntil: anchor.BN;
    dataLocation: any;
    revoked: boolean;
    recipients: Array<PublicKey>;
    data: Buffer;
  } = {
    id: startId,
    schemaId: schemaIds[0],
    linkedAttestationId: new anchor.BN(0),
    attestTimestamp: new anchor.BN(0),
    revokeTimestamp: new anchor.BN(0),
    data: Buffer.from(""),
    attester: wallet.publicKey,
    validUntil: new anchor.BN(Math.floor(Date.now() / 1000)),
    dataLocation: { onchain: {} },
    revoked: false,
    recipients: _createMockRecipients(),
  };

  let attestation2: {
    id: anchor.BN;
    schemaId: anchor.BN;
    linkedAttestationId: anchor.BN;
    attestTimestamp: anchor.BN;
    revokeTimestamp: anchor.BN;
    attester: PublicKey;
    validUntil: anchor.BN;
    dataLocation: any;
    revoked: boolean;
    recipients: Array<PublicKey>;
    data: Buffer;
  } = {
    id: startId.add(new anchor.BN(1)),
    schemaId: schemaIds[1],
    linkedAttestationId: new anchor.BN(0),
    attestTimestamp: new anchor.BN(0),
    revokeTimestamp: new anchor.BN(0),
    data: Buffer.from([]),
    attester: wallet.publicKey,
    validUntil: new anchor.BN(Math.floor(Date.now() / 1000)),
    dataLocation: { onchain: {} },
    revoked: false,
    recipients: _createMockRecipients(),
  };

  const indexingKeys = ["test indexing key 0", "test indexing key 1"];

  return [[attestation, attestation2], indexingKeys];
}

export function _createMockRecipients() {
  const pubkeys = [
    anchor.web3.Keypair.generate().publicKey,
    anchor.web3.Keypair.generate().publicKey,
  ];

  return pubkeys;
}

export function _createMockReasons() {
  return ["Reason 1", "Reason 2"];
}
