import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * This endpoint receives messages FROM agents (especially the Planner agent)
 * When a group is created and itinerary is sent, this stores it in the database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Webhook received from agent:', {
      sender: body.sender,
      type: body.type,
      hasItinerary: !!body.itinerary,
      hasGroupId: !!body.group_id,
      hasTravelers: !!body.travelers,
      memberCount: body.members?.length
    });

    // Extract data from agent message
    const {
      sender,
      recipient,
      type = 'itinerary',
      group_id,
      itinerary,
      destination,
      members,
      travelers,
      group_info,
      message
    } = body;

    // Store the group and itinerary in database
    if (group_id && itinerary) {
      // First, create or update the group
      const { data: groupData, error: groupError } = await supabase
        .from('agent_groups')
        .upsert({
          group_id,
          destination: destination || group_info?.destination,
          member_count: members?.length || 0,
          members: members || [],
          travelers: travelers || [],
          itinerary,
          status: 'matched',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'group_id'
        })
        .select()
        .single();

      if (groupError) {
        console.error('❌ Error storing group:', groupError);
        return NextResponse.json({ 
          success: false, 
          error: groupError.message 
        }, { status: 500 });
      }

      console.log('✅ Group stored:', groupData);

      // Store itinerary message in group messages
      const { error: messageError } = await supabase
        .from('group_messages')
        .insert({
          group_id,
          user_id: 'PLANNER_AGENT',
          message: itinerary,
          is_agent: true,
          created_at: new Date().toISOString()
        });

      if (messageError) {
        console.error('⚠️ Error storing itinerary message:', messageError);
      }

      // If recipient is specified, store in user's messages too
      if (recipient) {
        const { error: userMessageError } = await supabase
          .from('planner_bridge_messages')
          .insert({
            user_id: recipient,
            message: `📋 Group Created! Your itinerary is ready.\n\n${itinerary}`,
            is_agent: true,
            sender: 'planner',
            created_at: new Date().toISOString()
          });

        if (userMessageError) {
          console.error('⚠️ Error storing user message:', userMessageError);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Group and itinerary stored successfully',
        group_id 
      });
    }

    // If it's just a message without group creation
    if (message && recipient) {
      const { error: messageError } = await supabase
        .from('planner_bridge_messages')
        .insert({
          user_id: recipient,
          message,
          is_agent: true,
          sender: sender || 'agent',
          created_at: new Date().toISOString()
        });

      if (messageError) {
        console.error('❌ Error storing message:', messageError);
        return NextResponse.json({ 
          success: false, 
          error: messageError.message 
        }, { status: 500 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Message stored successfully' 
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Missing required fields' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Also support GET for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'active',
    endpoint: '/api/agent-webhook',
    purpose: 'Receives messages from Agentverse agents',
    timestamp: new Date().toISOString()
  });
}
