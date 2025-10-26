import { NextRequest, NextResponse } from 'next/server'
import { Client, ContractExecuteTransaction, ContractFunctionParameters, PrivateKey, AccountId } from '@hashgraph/sdk'

// Initialize Hedera client
function getHederaClient() {
  const accountId = process.env.HEDERA_ACCOUNT_ID
  let privateKey = process.env.HEDERA_PRIVATE_KEY
  const network = process.env.HEDERA_NETWORK || 'testnet'

  if (!accountId || !privateKey) {
    throw new Error('Hedera credentials not configured in environment variables')
  }

  // Remove 0x prefix if present (Hedera SDK doesn't like it)
  if (privateKey.startsWith('0x')) {
    privateKey = privateKey.substring(2)
  }

  console.log('🔑 Using account:', accountId)
  console.log('🔑 Private key length:', privateKey.length)

  const client = network === 'mainnet'
    ? Client.forMainnet()
    : Client.forTestnet()

  try {
    client.setOperator(AccountId.fromString(accountId), PrivateKey.fromStringECDSA(privateKey))
  } catch (error) {
    console.error('❌ Failed to set operator:', error)
    throw new Error('Invalid Hedera credentials format')
  }

  return client
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { groupId, destination, memberCount, createdAt } = body

    console.log('🔐 API: Registering group on Hedera...', { groupId, destination, memberCount })

    // Validate inputs
    if (!groupId || !destination || !memberCount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get contract ID from environment
    const contractId = process.env.NEXT_PUBLIC_GROUP_REGISTRY_CONTRACT_ID
    if (!contractId) {
      return NextResponse.json(
        { success: false, error: 'Contract ID not configured' },
        { status: 500 }
      )
    }

    // Initialize Hedera client
    const client = getHederaClient()

    // Prepare contract parameters
    const params = new ContractFunctionParameters()
      .addString(groupId)
      .addString(destination)
      .addUint256(memberCount)
      .addUint256(Math.floor(new Date(createdAt).getTime() / 1000))

    console.log('📝 Executing contract transaction...')
    console.log('📝 Contract ID:', contractId)
    console.log('📝 Gas limit: 300000')

    // Execute contract transaction
    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(300000)  // Increased from 100000
      .setFunction('registerGroup', params)

    const txResponse = await transaction.execute(client)
    const receipt = await txResponse.getReceipt(client)

    console.log('✅ Transaction successful:', receipt.status.toString())

    const transactionId = txResponse.transactionId.toString()

    return NextResponse.json({
      success: true,
      transactionId,
      contractId,
      status: receipt.status.toString()
    })

  } catch (error: any) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    )
  }
}
