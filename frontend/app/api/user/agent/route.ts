import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Check if agent already exists
    const { data: existingAgent } = await supabase
      .from('user_agent_states')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingAgent) {
      // Reactivate existing agent
      const { data, error } = await supabase
        .from('user_agent_states')
        .update({
          is_active: true,
          last_active_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      // Update user's agent_address
      await supabase
        .from('users')
        .update({ agent_address: existingAgent.agent_address })
        .eq('id', userId)

      return NextResponse.json({
        agent: data,
        message: 'Agent reactivated',
        isNew: false,
      })
    }

    // Generate agent seed and address (simplified for now)
    const agentSeed = `wanderlink_user_${userId}_seed_${Date.now()}`
    const agentAddress = `agent_${userId.substring(0, 8)}_${Date.now()}`

    // Create new agent state
    const { data: newAgent, error } = await supabase
      .from('user_agent_states')
      .insert([
        {
          user_id: userId,
          agent_address: agentAddress,
          agent_seed: agentSeed,
          is_active: true,
          last_active_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    // Update user's agent_address
    await supabase
      .from('users')
      .update({ agent_address: agentAddress })
      .eq('id', userId)

    // In production, this would trigger the actual user agent to start
    // via the agent_service.py endpoint
    // await fetch('http://localhost:8000/create-user-agent', {
    //   method: 'POST',
    //   body: JSON.stringify({ userId, agentSeed }),
    // })

    return NextResponse.json({
      agent: newAgent,
      message: 'Agent created successfully',
      isNew: true,
    })
  } catch (error: any) {
    console.error('Create agent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create agent' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: agent, error } = await supabase
      .from('user_agent_states')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ agent })
  } catch (error: any) {
    console.error('Get agent error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get agent' },
      { status: 500 }
    )
  }
}
