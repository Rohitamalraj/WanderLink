"""
Agentverse Chat Client - Send messages directly to Agentverse agent chat
"""

import httpx
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

AGENTVERSE_API_KEY = os.getenv("AGENTVERSE_API_KEY", "")


async def send_to_agent_chat(
    agent_address: str,
    message: str,
    timeout: float = 30.0
) -> Optional[str]:
    """
    Send a message to an Agentverse agent's chat and get response
    
    Args:
        agent_address: The agent address (e.g., agent1q...)
        message: The text message to send
        timeout: Request timeout in seconds
        
    Returns:
        Agent's response text or None if failed
    """
    if not AGENTVERSE_API_KEY:
        print("⚠️ No AGENTVERSE_API_KEY found")
        return None
    
    try:
        # Try the chat submission endpoint
        chat_url = f"https://agentverse.ai/v1beta1/engine/chat/sessions/{agent_address}/submit"
        
        async with httpx.AsyncClient() as client:
            print(f"📤 Sending to agent chat: {agent_address[:16]}...")
            
            response = await client.post(
                chat_url,
                headers={
                    "Authorization": f"bearer {AGENTVERSE_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "payload": message,
                    "session": agent_address
                },
                timeout=timeout
            )
            
            print(f"📡 Response status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Got response from agent")
                
                # Try to extract response text from various possible fields
                if isinstance(result, dict):
                    response_text = (
                        result.get("response") or 
                        result.get("message") or 
                        result.get("reply") or
                        result.get("output") or
                        result.get("text")
                    )
                    
                    if response_text:
                        return str(response_text)
                    else:
                        # Log the structure for debugging
                        print(f"⚠️ Response structure: {list(result.keys())}")
                        # Return as JSON string if no text field found
                        import json
                        return json.dumps(result)
                        
                return str(result)
            else:
                print(f"❌ Failed: {response.status_code}")
                print(f"   Body: {response.text[:200]}")
                return None
                
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None
