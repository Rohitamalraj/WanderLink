import {
  Client,
  PrivateKey,
  AccountId,
  ContractExecuteTransaction,
  ContractCallQuery,
  Hbar,
  ContractFunctionParameters,
} from '@hashgraph/sdk'

// Hedera configuration
const HEDERA_NETWORK = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'
const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID || ''
const HEDERA_PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY || ''

// Group Registry Contract (you'll need to deploy this)
const GROUP_REGISTRY_CONTRACT_ID = process.env.NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID || ''

export interface GroupFormationData {
  groupId: string
  destination: string
  members?: string[]
  memberCount: number
  createdAt: string
}

export interface GroupRegistrationResult {
  success: boolean
  transactionId?: string
  explorerUrl?: string
  error?: string
}

/**
 * Initialize Hedera client
 */
function getHederaClient(): Client {
  let client: Client

  if (HEDERA_NETWORK === 'testnet') {
    client = Client.forTestnet()
  } else if (HEDERA_NETWORK === 'mainnet') {
    client = Client.forMainnet()
  } else {
    throw new Error('Invalid Hedera network')
  }

  if (!HEDERA_ACCOUNT_ID || !HEDERA_PRIVATE_KEY) {
    throw new Error('Hedera credentials not configured')
  }

  client.setOperator(
    AccountId.fromString(HEDERA_ACCOUNT_ID),
    PrivateKey.fromString(HEDERA_PRIVATE_KEY)
  )

  return client
}

/**
 * Register a travel group on Hedera blockchain via API route
 */
export async function registerGroupOnChain(
  groupData: GroupFormationData
): Promise<GroupRegistrationResult> {
  try {
    console.log('🔗 Registering group on Hedera via API...', groupData)

    // Call API route to register on blockchain
    const response = await fetch('/api/register-group', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        groupId: groupData.groupId,
        destination: groupData.destination,
        memberCount: groupData.memberCount,
        createdAt: groupData.createdAt,
      }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Registration failed')
    }

    const transactionId = result.transactionId
    const explorerUrl = `https://hashscan.io/${HEDERA_NETWORK}/transaction/${transactionId}`

    console.log('✅ Group registered on Hedera:', {
      transactionId,
      explorerUrl,
    })

    // Store transaction info in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `group_tx_${groupData.groupId}`,
        JSON.stringify({
          transactionId,
          explorerUrl,
          timestamp: new Date().toISOString(),
          groupId: groupData.groupId,
          destination: groupData.destination,
          contractId: result.contractId,
        })
      )
    }

    return {
      success: true,
      transactionId,
      explorerUrl,
    }
  } catch (error) {
    console.error('❌ Error registering group on Hedera:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Query group information from blockchain
 */
export async function getGroupFromChain(
  groupId: string
): Promise<any> {
  try {
    const client = getHederaClient()

    if (!GROUP_REGISTRY_CONTRACT_ID) {
      throw new Error('Group Registry Contract ID not configured')
    }

    const query = new ContractCallQuery()
      .setContractId(GROUP_REGISTRY_CONTRACT_ID)
      .setGas(50000)
      .setFunction('getGroup', new ContractFunctionParameters().addString(groupId))

    const result = await query.execute(client)
    
    // Parse result based on your contract's return structure
    return {
      exists: true,
      data: result,
    }
  } catch (error) {
    console.error('❌ Error querying group from Hedera:', error)
    return {
      exists: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get transaction info from localStorage
 */
export function getGroupTransactionInfo(groupId: string) {
  if (typeof window === 'undefined') return null
  
  const txInfo = localStorage.getItem(`group_tx_${groupId}`)
  return txInfo ? JSON.parse(txInfo) : null
}

/**
 * Check if group is registered on-chain
 */
export function isGroupRegisteredOnChain(groupId: string): boolean {
  return !!getGroupTransactionInfo(groupId)
}
