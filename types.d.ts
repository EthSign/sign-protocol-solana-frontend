export interface Attestation {
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
}

export interface Schema {
    id: anchor.BN;
    registrant: PublicKey;
    revocable: boolean;
    dataLocation: any;
    maxValidFor: anchor.BN;
    timestamp: anchor.BN;
    data: string;
  }