import { 
  Client, 
  AccountCreateTransaction, 
  Hbar, 
  TransferTransaction,
  PrivateKey,
  AccountId
} from '@hashgraph/sdk';

/**
 * Escrow Service for holding staked funds until location verification
 */
export class EscrowService {
  private client: Client;
  private escrowAccountId?: string;
  private escrowPrivateKey?: PrivateKey;

  constructor(client: Client) {
    this.client = client;
  }

  /**
   * Create an escrow account to hold staked funds
   */
  async createEscrowAccount(): Promise<{ accountId: string; privateKey: string }> {
    const escrowKey = PrivateKey.generateECDSA();
    
    const transaction = new AccountCreateTransaction()
      .setKey(escrowKey.publicKey)
      .setInitialBalance(new Hbar(0))
      .setAccountMemo('Staking Escrow Account');

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);
    
    this.escrowAccountId = receipt.accountId!.toString();
    this.escrowPrivateKey = escrowKey;

    return {
      accountId: this.escrowAccountId,
      privateKey: escrowKey.toStringRaw(),
    };
  }

  /**
   * Lock funds in escrow
   */
  async lockFunds(
    fromAccountId: string,
    amount: number
  ): Promise<string> {
    if (!this.escrowAccountId) {
      throw new Error('Escrow account not created');
    }

    const transaction = new TransferTransaction()
      .addHbarTransfer(fromAccountId, new Hbar(-amount))
      .addHbarTransfer(this.escrowAccountId, new Hbar(amount))
      .setTransactionMemo(`Staking escrow: ${amount} HBAR`);

    const txResponse = await transaction.execute(this.client);
    const receipt = await txResponse.getReceipt(this.client);

    return txResponse.transactionId.toString();
  }

  /**
   * Release funds from escrow after location verification
   */
  async releaseFunds(
    toAccountId: string,
    amount: number
  ): Promise<string> {
    if (!this.escrowAccountId || !this.escrowPrivateKey) {
      throw new Error('Escrow account not initialized');
    }

    // Create a client with escrow account as operator
    const escrowClient = this.client.setOperator(
      AccountId.fromString(this.escrowAccountId),
      this.escrowPrivateKey
    );

    const transaction = new TransferTransaction()
      .addHbarTransfer(this.escrowAccountId, new Hbar(-amount))
      .addHbarTransfer(toAccountId, new Hbar(amount))
      .setTransactionMemo(`Funds released: ${amount} HBAR`);

    const txResponse = await transaction.execute(escrowClient);
    const receipt = await txResponse.getReceipt(escrowClient);

    return txResponse.transactionId.toString();
  }

  /**
   * Get escrow account balance
   */
  async getEscrowBalance(): Promise<number> {
    if (!this.escrowAccountId) {
      throw new Error('Escrow account not created');
    }

    const balance = await this.client
      .getAccountBalance(AccountId.fromString(this.escrowAccountId));
    
    return balance.hbars.toTinybars().toNumber() / 100000000; // Convert to HBAR
  }

  getEscrowAccountId(): string | undefined {
    return this.escrowAccountId;
  }
}
