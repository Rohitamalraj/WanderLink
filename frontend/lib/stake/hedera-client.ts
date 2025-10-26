import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';

export interface HederaClientConfig {
  accountId: string;
  privateKey: string;
  network?: 'testnet' | 'mainnet';
}

export function createHederaClient(config: HederaClientConfig): Client {
  const { accountId, privateKey, network = 'testnet' } = config;

  // Remove 0x prefix if present
  const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey.substring(2) : privateKey;

  const client = network === 'mainnet' 
    ? Client.forMainnet() 
    : Client.forTestnet();

  client.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromStringECDSA(cleanPrivateKey)
  );

  return client;
}

export function validateStakeHederaConfig(): boolean {
  const required = [
    'STAKE_COORDINATOR_ACCOUNT_ID',
    'STAKE_COORDINATOR_PRIVATE_KEY',
    'STAKE_VALIDATOR_ACCOUNT_ID',
    'STAKE_VALIDATOR_PRIVATE_KEY'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${key}`);
      return false;
    }
  }

  return true;
}
