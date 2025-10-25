import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Convert user_id string to deterministic UUID (matches Python agent logic)
 */
function userIdToUuid(userId: string): string {
  const hash = crypto.createHash('md5').update(userId).digest();
  // Format as UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const hex = hash.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Check if user has been matched to a group
 * GET /api/agent-groups/check/:userId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking group for user:', userId);

    // Convert user_id to UUID format (matches planner agent logic)
    const userUuid = userIdToUuid(userId);
    console.log('🔄 Converted to UUID:', userUuid);

    // First check agent_groups table (new format)
    let { data: groups, error } = await supabase
      .from('agent_groups')
      .select('*')
      .contains('members', [userId])
      .order('created_at', { ascending: false })
      .limit(1);

    // If not found, check groups table (old format from planner service)
    if (!groups || groups.length === 0) {
      // Check groups table via group_members join using UUID
      const { data: memberData } = await supabase
        .from('group_members')
        .select('group_id, groups(*)')
        .eq('user_id', userUuid)
        .order('joined_at', { ascending: false })
        .limit(1);

      console.log('📊 Group members query result:', memberData);

      if (memberData && memberData.length > 0) {
        const groupRecord = memberData[0].groups as any;
        groups = [{
          group_id: groupRecord.id,
          destination: groupRecord.destination,
          members: [], // Will be populated below
          member_count: groupRecord.member_count,
          itinerary: groupRecord.itinerary,
          created_at: groupRecord.created_at,
          status: groupRecord.status
        }];
      }
    }

    if (!groups || groups.length === 0) {
      console.log('⏳ No group found yet for user:', userId);
      return NextResponse.json({
        status: 'waiting',
        in_group: false,
        message: 'No group found yet'
      });
    }

    const group = groups[0];
    console.log('✅ Group found:', {
      group_id: group.group_id,
      destination: group.destination,
      members: group.members?.length
    });

    // Fetch group messages
    const { data: messages } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', group.group_id)
      .order('created_at', { ascending: true });

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
        created_at: group.created_at,
        status: group.status
      },
      messages: messages || []
    });

  } catch (error) {
    console.error('❌ Error checking group:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
