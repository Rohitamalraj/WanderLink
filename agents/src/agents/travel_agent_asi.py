from datetime import datetime
from uuid import uuid4
import json
from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)
from openai import OpenAI

AGENT_NAME = "TravelAgent"
MATCHMAKER_ADDRESS = "agent1qdsd9mu8uhgkruel696xp532q7kuqzgc9wknnt5w5u57rg0atf5v2v5nrmt"
API_KEY = "sk_7aa8a96be59b426695dcd1a2ee00e5807c2903f9c43b4f1c8d84d8fb52ac62a4"

client = OpenAI(base_url="https://api.asi1.ai/v1", api_key=API_KEY)

agent = Agent(name=AGENT_NAME)
protocol = Protocol(spec=chat_protocol_spec)

# ---------------------------
# Handle incoming user message
# ---------------------------

@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    # Acknowledge
    await ctx.send(sender, ChatAcknowledgement(
        timestamp=datetime.now(),
        acknowledged_msg_id=msg.msg_id
    ))

    # Extract text
    text = ""
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text.strip() + " "

    ctx.logger.info(f"📨 Received user message: {text}")
    
    # Extract USER_ID if present in message
    user_id = sender  # Default to sender address
    if "[USER_ID:" in text:
        try:
            user_id = text.split("[USER_ID:")[1].split("]")[0]
            text = text.split("[USER_ID:")[0].strip()  # Remove USER_ID from text
            ctx.logger.info(f"👤 Extracted user_id: {user_id}")
        except:
            pass

    ctx.logger.info(f"📨 Received user message: {text}")

    # Use ASI-1 to extract structured preferences
    try:
        extract_prompt = f"""
        Extract structured travel preferences from this user message:
        "{text}"

        Output ONLY valid JSON (no markdown, no explanations) with these exact keys:
        {{
          "destination": "city or country name",
          "duration": number of days as integer,
          "budget": budget amount as integer (without currency symbols),
          "travel_type": "type of travel (e.g., beach vacation, adventure, cultural)",
          "group_type": "solo, couple, friends, or family",
          "interests": ["list", "of", "interests"]
        }}

        Rules:
        - If any field cannot be determined, use reasonable defaults
        - Duration must be an integer (number of days)
        - Budget must be an integer (just the number)
        - All string fields must have non-empty values
        - interests must be an array with at least one item
        """
        
        ctx.logger.info("🤖 Calling ASI-1 to extract preferences...")
        r = client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {"role": "system", "content": "You are a travel planner assistant that extracts structured travel preferences. Always output valid JSON only."},
                {"role": "user", "content": extract_prompt}
            ],
        )
        preferences_text = r.choices[0].message.content.strip()
        
        # Remove markdown code blocks if present
        if preferences_text.startswith("```"):
            preferences_text = preferences_text.split("```")[1]
            if preferences_text.startswith("json"):
                preferences_text = preferences_text[4:]
        
        preferences_text = preferences_text.strip()
        ctx.logger.info(f"📝 Extracted preferences JSON: {preferences_text}")
        
        preferences = json.loads(preferences_text)
        
        # Validate extracted preferences
        if not preferences.get("destination") or preferences.get("destination") == "":
            raise ValueError("No destination could be extracted from user message")

        # Send structured preferences to MatchMakerAgent
        trip_data = {
            "user_id": user_id,  # Use extracted user_id (test_xxx) instead of sender address
            "preferences": preferences
        }
        
        ctx.logger.info(f"📤 Sending to MatchMaker: {json.dumps(trip_data)}")
        
        await ctx.send(MATCHMAKER_ADDRESS, ChatMessage(
            timestamp=datetime.utcnow(),
            msg_id=uuid4(),
            content=[TextContent(type="text", text=json.dumps(trip_data))]
        ))

        # Respond to user
        response_text = (
            "✅ Preferences received! Once a group is formed with other travelers, "
            "your personalized itinerary will be sent here."
        )

    except json.JSONDecodeError as e:
        ctx.logger.error(f"❌ Failed to parse JSON from ASI-1 response")
        ctx.logger.exception(e)
        response_text = f"Oops! Could not understand your travel preferences. Please try again with more details about where you want to go."
    
    except Exception as e:
        ctx.logger.exception("❌ Error extracting preferences")
        response_text = f"Oops! Could not process your travel preferences. Please try again."

    await ctx.send(sender, ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[
            TextContent(type="text", text=response_text),
            EndSessionContent(type="end-session")
        ]
    ))

@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass

agent.include(protocol, publish_manifest=True)