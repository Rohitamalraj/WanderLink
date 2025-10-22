"""
Example ASI:One Compatible Agent from Documentation
This shows the exact pattern for chat protocol implementation
"""

from datetime import datetime
from uuid import uuid4
from openai import OpenAI
from uagents import Context, Protocol, Agent
from uagents_core.contrib.protocols.chat import (
    ChatAcknowledgement,
    ChatMessage,
    EndSessionContent,
    TextContent,
    chat_protocol_spec,
)

# Example Expert Assistant
subject_matter = "the sun"

client = OpenAI(
    base_url='https://api.asi1.ai/v1',
    api_key='<your_api_key>',
)

agent = Agent()

# Create protocol with chat_protocol_spec
protocol = Protocol(spec=chat_protocol_spec)

# Handler for chat messages
@protocol.on_message(ChatMessage)
async def handle_message(ctx: Context, sender: str, msg: ChatMessage):
    # Send acknowledgement
    await ctx.send(
        sender,
        ChatAcknowledgement(timestamp=datetime.now(), acknowledged_msg_id=msg.msg_id),
    )
    
    # Collect text chunks
    text = ''
    for item in msg.content:
        if isinstance(item, TextContent):
            text += item.text
    
    # Process and generate response
    response = 'I am afraid something went wrong'
    try:
        r = client.chat.completions.create(
            model="asi1-mini",
            messages=[
                {"role": "system", "content": f"You are a helpful assistant who only answers questions about {subject_matter}."},
                {"role": "user", "content": text},
            ],
            max_tokens=2048,
        )
        response = str(r.choices[0].message.content)
    except:
        ctx.logger.exception('Error querying model')
    
    # Send response back
    await ctx.send(sender, ChatMessage(
        timestamp=datetime.utcnow(),
        msg_id=uuid4(),
        content=[
            TextContent(type="text", text=response),
            EndSessionContent(type="end-session"),
        ]
    ))

@protocol.on_message(ChatAcknowledgement)
async def handle_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    pass

# Attach protocol to agent with publish_manifest=True
agent.include(protocol, publish_manifest=True)
