import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      group_id,
      destination,
      user_ids,
      itinerary,
      travelers,
      created_at = new Date().toISOString()
    } = body;

    // 1. Insert group
    const { error: groupError } = await supabase
      .from('groups')
      .upsert({
        id: group_id,
        destination,
        itinerary,
        member_count: user_ids.length,
        created_at,
        status: 'active'
      });

    if (groupError) {
      return NextResponse.json({ success: false, error: groupError.message }, { status: 500 });
    }

    // 2. Insert group members
    const membersData = user_ids.map(uid => ({
      group_id,
      user_id: uid,
      joined_at: created_at
    }));
    await supabase.from('group_members').upsert(membersData);

    // 3. Insert itinerary as first group message
    await supabase.from('group_messages').insert({
      group_id,
      user_id: 'PLANNER_AGENT',
      message: itinerary,
      is_agent: true,
      created_at
    });

    return NextResponse.json({ success: true, group_id });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
