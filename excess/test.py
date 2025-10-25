import httpx
import uuid
import json
from datetime import datetime, timezone

MAILBOX_API = "https://agentverse.ai/v1/submit"
API_KEY = "eyJhbGciOiJSUzI1NiJ9.eyJleHAiOjE3NjM4ODQ0NjksImlhdCI6MTc2MTI5MjQ2OSwiaXNzIjoiZmV0Y2guYWkiLCJqdGkiOiIxNDM5M2QzY2YwYjQ3OTY1YjIyNGI2MmMiLCJzY29wZSI6ImF2Iiwic3ViIjoiYWJhYmMxZmZmY2MzYjQ2ZTE4ODdlZTQwMzdlZmUyYmI0MDQwZWU0MzRkYzhlYTYyIn0.jdUHIo_5MogAo3DKoRPmt_AroVMX2O4nx3lCvJO_AqUcEpzTMVs69Ynl_90hljMirPMTlYq3y2YCIx97Akling9YnzvQz6_VVSuhs7rW_h4audWCfqZYkNo03A1c0lGbZQFbA26tAmtZq9fxzduCz44R9fw7EdUXh5T9Q6XL8JTp2a21A48uZYHVbB6EN_uUGk2flys0fDENyvTIgSAp-_lMDu7WcNQUwcp7vRyNOxWysNN0KiC28AzNYpWL4oeAJAqwXFD9PtxIJloZFNFwW-5fcULMpi7VwmV6f82ejsaI3VfqZ38Km7PEANJWIv2Yehhp5lJA3dOo7LWq9Ikgww"
  # must match registered agent name
TARGET_AGENT = "Travel Agent"
SCHEMA_DIGEST = "model:2601825997203ee07dbb9ff6e7c71ae7bdaf6a7c8b817361f2f88f4b29c68d0c"
PROTOCOL_DIGEST = "proto:30a801ed3a83f9a0ff0a9f1e6fe958cb91da1fc2218b153df7b6cbf87bd33d62"

def send_to_travel_agent(user_id, text):
    session_id = str(uuid.uuid4())

    # Minimal ChatMessage matching schema exactly
    message_payload = {
        "msg_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "content": [
            {
                "type": "text",
                "text": text
            }
        ]
    }

    envelope = {
    "version": "1.0",
    "sender": user_id,
    "target": "travel-agent",  # use internal agent ID, not display name
    "session": session_id,
    "schema_digest": SCHEMA_DIGEST,
    "protocol_digest": PROTOCOL_DIGEST,
    "payload": message_payload,
    "metadata": {}# pass the dict directly, NOT json.dumps(...)
}


    headers = {"Authorization": f"Bearer {API_KEY}"}

    print("=== Envelope being sent ===")
    print(json.dumps(envelope, indent=2))

    try:
        response = httpx.post(MAILBOX_API, json=envelope, headers=headers, timeout=15)
        response.raise_for_status()
        print("✅ Message sent successfully!")
        print(response.json())
        return session_id
    except httpx.HTTPStatusError as e:
        print("❌ Error:", e.response.text)
        return None

if __name__ == "__main__":
    user_id = "test_user_001"
    text = "Hi! I want to plan a trip to Goa from 15th December to 20th December, interested in beaches, food, and sightseeing."
    send_to_travel_agent(user_id, text)