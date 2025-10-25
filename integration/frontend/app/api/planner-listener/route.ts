import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PLANNER_ADDRESS = process.env.PLANNER_ADDRESS || '';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

let clientInstance: any = null;

async function getClient() {
  if (!clientInstance) {
    const UAgentClientModule = await import('uagent-client');
    const UAgentClient = UAgentClientModule.default || UAgentClientModule;

    clientInstance = new (UAgentClient as any)({
      timeout: 60000,
      autoStartBridge: true
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  return clientInstance;
}

/**
 * POST /api/planner-listener
 * This endpoint receives group creation data from the Planner agent
 * and stores it in Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Planner Listener received:', {
      hasGroupId: !!body.group_id,
      hasItinerary: !!body.itinerary,
      hasMembers: !!body.members,
      destination: body.destination
    });

    const {
      group_id,
      destination,
      members = [],
      itinerary,
      travelers = [],
      group_info = {},
      created_at = new Date().toISOString()
    } = body;

    if (!group_id || !itinerary) {
      return NextResponse.json(
        { error: 'Missing required fields: group_id and itinerary' },
        { status: 400 }
      );
    }

    // Store in travel_groups table
    const { data: groupData, error: groupError } = await supabase
      .from('travel_groups')
      .upsert({
        group_id,
        destination: destination || group_info.destination,
        members,
        member_count: members.length,
        itinerary,
        travelers,
        status: 'matched',
        created_at
      }, {
        onConflict: 'group_id'
      })
      .select()
      .single();

    if (groupError) {
      console.error('❌ Error storing group:', groupError);
      return NextResponse.json(
        { success: false, error: groupError.message },
        { status: 500 }
      );
    }

    console.log('✅ Group stored successfully:', group_id);

    // Store itinerary as first group message
    const { error: messageError } = await supabase
      .from('group_messages')
      .insert({
        group_id,
        user_id: 'PLANNER_AGENT',
        message: itinerary,
        is_agent: true,
        created_at
      });

    if (messageError) {
      console.warn('⚠️ Error storing group message:', messageError);
    }

    // Notify each member
    for (const memberId of members) {
      const { error: notifyError } = await supabase
        .from('planner_bridge_messages')
        .insert({
          user_id: memberId,
          message: `🎉 Group Created! You've been matched for ${destination || 'your trip'}!\n\nGroup ID: ${group_id}\n\nCheck your groups to see the full itinerary.`,
          is_agent: true,
          sender: 'planner',
          created_at
        });

      if (notifyError) {
        console.warn(`⚠️ Error notifying member ${memberId}:`, notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Group created and stored successfully',
      group_id,
      members_notified: members.length
    });

  } catch (error) {
    console.error('❌ Planner listener error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/planner-listener?userId=xxx
 * Poll for group creation status for a specific user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking for groups for user:', userId);

    // Check if user has any groups
    const { data: groups, error } = await supabase
      .from('travel_groups')
      .select('*')
      .contains('members', [userId])
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching groups:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!groups || groups.length === 0) {
      return NextResponse.json({
        status: 'waiting',
        in_group: false,
        message: 'No group found yet. Waiting for matches...'
      });
    }

    const group = groups[0];

    // Fetch group messages
    const { data: messages } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', group.group_id)
      .order('created_at', { ascending: true });

    console.log('✅ Group found for user:', {
      group_id: group.group_id,
      destination: group.destination,
      members: group.members?.length
    });

    return NextResponse.json({
      status: 'in_group',
      in_group: true,
      group: {
        id: group.group_id,
        group_id: group.group_id,
        destination: group.destination,
        members: group.members || [],
        member_count: group.member_count || 0,
        itinerary: group.itinerary,
        travelers: group.travelers || [],
        created_at: group.created_at,
        status: group.status
      },
      messages: messages || []
    });

  } catch (error) {
    console.error('❌ Error in GET planner-listener:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
