import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';

export interface HederaClientConfig {
  accountId: string;
  privateKey: string;
  network?: 'testnet' | 'mainnet';
}

export function createHederaClient(config: HederaClientConfig): Client {
  const { accountId, privateKey, network = 'testnet' } = config;

  const client = network === 'mainnet' 
    ? Client.forMainnet() 
    : Client.forTestnet();

  client.setOperator(
    AccountId.fromString(accountId),
    PrivateKey.fromStringECDSA(privateKey)
  );

  return client;
}

export function validateHederaConfig(): boolean {
  const required = [
    'HEDERA_ACCOUNT_ID',
    'HEDERA_PRIVATE_KEY',
    'VALIDATOR_ACCOUNT_ID',
    'VALIDATOR_PRIVATE_KEY'
  ];

  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${key}`);
      return false;
    }
  }

  return true;
}
